import subprocess
import json
import io
from contextlib import redirect_stdout
import stopit
import os
import re
import threading
import sys

import ast


def __filter_escapes(string):
    string = (
    string
        .replace('\n', '')  # Newline
        .replace('\r', '')  # Carriage return
        .replace('\t', '')  # Tab
        .replace('\b', '')  # Backspace
        .replace('\f', '')  # Form feed
        .replace('\a', '')  # Alert sound
        .replace('\\', '')  # Literal backslash
    )
    return string


# Rewrite additional file names to their real paths, e.g. 'sample.fasta' or './sample.fasta' -> '<path>/sample.fasta'
# Longer names go first and the name must stand alone, so 'a.txt' never touches 'data.txt' or an already rewritten path
def __rewrite_addfile(code, addfile=[]):
    for afpath in sorted(addfile, key=lambda p: len(os.path.split(p)[-1]), reverse=True):
        afname = os.path.split(afpath)[-1]
        pattern = r"(?<![\w\-./\\])(?:\.[/\\])?" + re.escape(afname) + r"(?![\w\-]|\.\w)"
        # forward slashes so a Windows path never turns into escape sequences inside a string literal
        code = re.sub(pattern, lambda m: afpath.replace("\\", "/"), code)
    return code


# Only reading files is allowed, anything that can write, truncate or delete files is blocked
__WRITE_CALLS = (".write(", ".writelines(", "write_text(", "write_bytes(", "os.remove(", "os.unlink(", "os.rename(", "os.replace(", "os.rmdir(", "os.removedirs(", "os.truncate(", "os.open(", "shutil.", ".unlink(", ".rmdir(", ".touch(")
__WRITE_OS_NAMES = ("remove", "unlink", "rename", "replace", "rmdir", "removedirs", "truncate", "open")

def __has_write(code):
    if any(w in code for w in __WRITE_CALLS):
        return True
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return False
    for node in ast.walk(tree):
        # import shutil / from shutil import rmtree / from os import remove
        if isinstance(node, ast.Import) and any(a.name.split(".")[0] == "shutil" for a in node.names):
            return True
        if isinstance(node, ast.ImportFrom) and node.module:
            if node.module.split(".")[0] == "shutil":
                return True
            if node.module == "os" and any(a.name in __WRITE_OS_NAMES or a.name == "*" for a in node.names):
                return True
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        name = func.id if isinstance(func, ast.Name) else func.attr if isinstance(func, ast.Attribute) else None
        if name != "open":
            continue
        # open(path) defaults to read, any explicit mode must be a plain read mode
        mode = node.args[1] if len(node.args) > 1 else next((k.value for k in node.keywords if k.arg == "mode"), None)
        if mode is None:
            continue
        if not (isinstance(mode, ast.Constant) and isinstance(mode.value, str)) or any(c in mode.value for c in "wax+"):
            return True
    return False



# Validation by nbgrader
def __validate(filename):
    cmd = f'python -m nbgrader validate {filename}'
    temp_f = io.StringIO()
    with redirect_stdout(temp_f):
        res = subprocess.run(cmd.split(), stdout=subprocess.PIPE)
    out = __filter_escapes(res.stdout.decode("utf-8"))
    if(out == "" or out.startswith("THE CONTENTS ")):
        return False
    else:
        return True
    


# Question information generator (for faster proccessing)
def QinfoGenerate(Question, addfile=[]) -> dict:
    temporarySplitWord = "+|spliter|+"
    template = {
        "Tester": "",
        "TesterLoc": 0,
        "Testcase":[],
        "Points": []
    }

    # Read question file
    with open(Question, "r", encoding= "utf-8") as f:
        Qfile = json.loads(f.read())

    # Filter code cell
    ScodeCell = [i for i in Qfile["cells"] if (i.get("cell_type") == "code" and i["metadata"].get("nbgrader") != None)]

    # Tester
    for i in range(len(ScodeCell)):
        if (ScodeCell[i]["metadata"]["nbgrader"]["solution"] == False) and (ScodeCell[i]["metadata"]["nbgrader"].get("points") is None) and "mock_stdout.getvalue()" in "".join(ScodeCell[i]["source"]):
            template["TesterLoc"] = i
            template["Tester"] = "".join(ScodeCell[i]["source"])
        

    # Testcase
    isPeriod = False
    temporaryTestcase = ""
    for i in range(len(ScodeCell)):
        if (ScodeCell[i]["metadata"]["nbgrader"]["solution"] == False) and (ScodeCell[i]["metadata"]["nbgrader"].get("points") != None):
            if not isPeriod:
                isPeriod = not isPeriod
            template["Points"].append(ScodeCell[i]["metadata"]["nbgrader"].get("points"))
            temporaryTestcase += "".join(ScodeCell[i]["source"]) + temporarySplitWord
            if i != len(ScodeCell)-1:
                continue

        if isPeriod or i == len(ScodeCell)-1:
            if temporaryTestcase == "":
                continue

            # replacing file path
            temporaryTestcase = __rewrite_addfile(temporaryTestcase, addfile)

            tempararyTSCL = temporaryTestcase.split(temporarySplitWord)
            if len(tempararyTSCL) != 0:
                if tempararyTSCL[0] == "":
                    tempararyTSCL = tempararyTSCL[1:]
                if tempararyTSCL[-1] == "":
                    tempararyTSCL = tempararyTSCL[:-1]
                
            template["Testcase"].append(tempararyTSCL)
            temporaryTestcase = ""
            isPeriod = not isPeriod

    return template
    
def __detect_tab_size(lines):
    def_indent = None
    first_line_indent = None
    
    for line in lines:
        match = re.match(r"^( *)(def )", line)
        if match:
            def_indent = len(match.group(1))
            continue
        
        if def_indent is not None:
            match = re.match(r"^( +)\S", line)
            if match:
                first_line_indent = len(match.group(1))
                break
    
    if def_indent is not None and first_line_indent is not None:
        return first_line_indent - def_indent
    
    return 4

def __get_function_at_line(code, lineno):
    if not lineno:
        return None, (0, 0)
    """Finds and returns the function definition that starts at or before a given line number."""
    lines = code.splitlines()
    
    for i in range(lineno, -1, -1):  # Start from the given line and move upwards
        if lines[i].strip().startswith("def "):
            start = i
            break
    else:
        return None, None  # No function found before or at lineno

    # Find the end of the function
    end = start + 1 if len(lines) > 1 else start
    while len(lines) > 1 and end < len(lines) and not lines[end].strip().startswith("def "):
        end += 1

    func_code = "".join(lines[start:end])
    return func_code, (start, end)
    

def __max_less_or_equal(lst, num):
    return max((x for x in lst if x <= num), default=None)

def __deflocate(code):
    def_loc = []

    lines = code.split("\n")
    for i in range(len(lines)):
        if "def " in lines[i]:
            def_loc.append(i)
    return def_loc
            


def __fix_syntax_errors(code_list, submitName):
    """Fix syntax errors one at a time until the script is valid."""
    fixed_list = []
    for code in code_list:
        tabSize = __detect_tab_size(code.split("\n"))
        fixing_times = 0
        while fixing_times < 100:
            fixing_times += 1
            def_loc = __deflocate(code)
            try:
                ast.parse(code)  # Try parsing the entire code
                break  # No errors, move to next
            except SyntaxError as e:
                errorMsg_arg = e.msg.split(" ")
                lineno = e.lineno - 1 if "line" not in e.msg else int(errorMsg_arg[errorMsg_arg.index("line") + 1]) - 1  # Line number of error

                func_code, (start, end) = __get_function_at_line(code, __max_less_or_equal(def_loc, lineno))

                if func_code:
                    # If error is inside a function, replace only that function
                    indent = func_code.split("def")[0]
                    func_name = func_code.split('(')[0].split()[1]
                    fixed_func = f"{indent}def {func_name}():\n{indent}{tabSize*' '}pass\n"
                    code_lines = code.splitlines(keepends=True)
                    code_lines[start:end] = [fixed_func]  # Replace function block
                    code = "".join(code_lines)
                else:
                    # If error is outside a function, just replace the bad line with "pass"
                    code_lines = code.splitlines(keepends=True)
                    if lineno <= len(code_lines):
                        code_lines[lineno - 1] = "pass\n"  # Replace bad line
                        code = "".join(code_lines)

        fixed_list.append(code)
    
    return fixed_list

# Public grade method    
def grade(Question, submit, addfile=[], validate=True, timeout=20, check_keyword="True", Qinfo=None, protectWrite=True):
    # Validating submittion
    if validate:
        if not __validate(submit): return True, "This file is not pass validation."

    # Read submited file
    with open(submit, "r", encoding= "utf-8") as f:
        submitfile = json.loads(f.read())
 
    codeCell = [i for i in submitfile["cells"] if (i.get("cell_type") == "code" and i["metadata"].get("nbgrader") != None)]

    temporarySplitWord = "+|spliter|+"
    solution = []
    for i in range(len(codeCell)):
        if codeCell[i]["metadata"]["nbgrader"]["solution"]:
            inserted_pass = codeCell[i]["source"]
            TempSol = temporarySplitWord.join(inserted_pass)

            cell_code = "".join(TempSol.split(temporarySplitWord))

            if(protectWrite):
                if __has_write(cell_code): return True, "This file contain file write method it may broke the additional assignment files"
            try:
                compile(cell_code, '<string>', 'exec')
                solution.append(cell_code)
            except SyntaxError:
                pass

    if Qinfo is None:
        Qinfo = QinfoGenerate(Question, addfile)

    score = []


    def __safe_input(*prompt):
        result = [None]

        # Check if input() is being mocked
        if "unittest.mock" in sys.modules and hasattr(sys.modules["unittest.mock"], "patch"):
            try:
                return input(" ".join(prompt))  # Use mock input
            except StopIteration:
                raise Exception("Mock input has run out")  # Halt execution in case of mock exhaustion

        def get_input():
            try:
                result[0] = input(" ".join(prompt))
            except EOFError:
                result[0] = ""

        thread = threading.Thread(target=get_input, daemon=True)
        thread.start()
        thread.join(timeout)

        if thread.is_alive():
            raise Exception("Input timed out")  # Halt execution if timeout occurs

        return result[0] if result[0] is not None else ""



    solutionSumed = __rewrite_addfile("\n".join(__fix_syntax_errors(solution, submit)), addfile)
    testcaseSumList = sum(Qinfo['Testcase'],[])

    for tcIndex in range(len(testcaseSumList)):
        temp_max_p = Qinfo["Points"][tcIndex]
        temp_cor_p = 0
        try:
            if(Qinfo["TesterLoc"] == 0):
                finalexec = [Qinfo["Tester"], solutionSumed, testcaseSumList[tcIndex]]
            else:
                finalexec = [solutionSumed, Qinfo["Tester"], testcaseSumList[tcIndex]]

            output = io.StringIO()
            with stopit.ThreadingTimeout(timeout) as context_manager:
                with redirect_stdout(output):
                    exec("\n\n".join(finalexec).replace("input(", "safe_input("), {"safe_input": __safe_input})

            results = [""]
            if context_manager.state != context_manager.TIMED_OUT:
                results = output.getvalue().strip("\n").split("\n")

            isPass = True
            for result in results:
                if(result != check_keyword):
                    isPass = False
                    break
            if(isPass): temp_cor_p += Qinfo["Points"][tcIndex]

        except Exception as e:
            print(e)
            pass
        score.append([temp_cor_p, temp_max_p])
    return False, score