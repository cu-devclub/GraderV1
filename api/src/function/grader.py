import subprocess
import json
from io import StringIO
from contextlib import redirect_stdout
import stopit
import os
import re
from collections import Counter

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



# Validation by nbgrader
def __validate(filename):
    cmd = f'python -m nbgrader validate {filename}'
    temp_f = StringIO()
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
            if(len(addfile) != 0):
                for afpath in addfile:
                    afname = os.path.split(afpath)[-1]
                    temporaryTestcase = temporaryTestcase.replace(afname, afpath)

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

def __insert_pass(lines):
    tabSize = __detect_tab_size(lines)
    new_lines = []
    for line in lines:
        match = re.match(r"^(\s*)def\s+\w+", line)
        if match:
            indent = match.group(1)  # Capture the leading spaces
            new_lines.append(line)
            new_lines.append(indent + " " * tabSize + "pass\n")  # Insert 'pass' with double indentation
        else:
            new_lines.append(line)
    return new_lines

def __get_function_at_line(code, lineno):
    """Finds and returns the function definition that starts at a given line number."""
    lines = code.splitlines(keepends=True)
    start = None

    for i, line in enumerate(lines):
        if line.strip().startswith("def ") and (i + 1) <= lineno:
            start = i  # Found a function that could contain the error
    
    if start is None:
        return None, None  # No function header found before the error line

    # Find where the function ends
    end = start + 1
    while end < len(lines) and not lines[end].strip().startswith("def "):
        end += 1  # Continue until the next function starts

    func_code = "".join(lines[start:end])
    return func_code, (start, end)

def __fix_syntax_errors(code_list):
    """Fix syntax errors one at a time until the script is valid."""
    fixed_list = []

    fixed_time = 0

    for code in code_list:
        while True:
            if fixed_time > 20:
                break
            fixed_time += 1
            try:
                ast.parse(code)  # Try parsing the entire code
                break  # No errors, move to next
            except SyntaxError as e:
                lineno = e.lineno  # Line number of error

                # Try to find the function where the error occurred
                func_code, (start, end) = __get_function_at_line(code, lineno)

                if func_code:
                    # If error is inside a function, replace only that function
                    func_name = func_code.split('(')[0].split()[1]
                    fixed_func = f"def {func_name}(): pass\n"
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
 
    # Filter code cell
    codeCell = [i for i in submitfile["cells"] if (i.get("cell_type") == "code" and i["metadata"].get("nbgrader") != None)]

    # Get solution cell
    temporarySplitWord = "+|spliter|+"
    solution = []
    for i in range(len(codeCell)):
        if codeCell[i]["metadata"]["nbgrader"]["solution"]:
            # inserted_pass = __insert_pass(codeCell[i]["source"])
            # TempSol = temporarySplitWord.join(inserted_pass)
            TempSol = temporarySplitWord.join(codeCell[i]["source"])

            # Write method protection
            if(protectWrite):
                if ".write(" in TempSol or "os.remove(" in TempSol: return True, "This file contain file write method it may broke the additional assignment files"
            
            # join solution
            solution.append("".join(TempSol.split(temporarySplitWord)))         

    if Qinfo is None:
        Qinfo = QinfoGenerate(Question, addfile)

    # if len(Qinfo) == 0:
    # return True, json.dumps(Qinfo)
    
    #check number of testcase list and solution
    # if len(Qinfo["Testcase"]) != len(solution):
    #     return True, f"Number of testcase and solution is not match. ({len(Qinfo['Testcase'])} testcase with {len(solution)} solution)"



    score = []



    solutionSumed = "\n".join(__fix_syntax_errors(solution))
    testcaseSumList = sum(Qinfo['Testcase'],[])

    for tcIndex in range(len(testcaseSumList)):
        temp_max_p = Qinfo["Points"][tcIndex]
        temp_cor_p = 0
        try:
            if(Qinfo["TesterLoc"] == 0):
                finalexec = [Qinfo["Tester"], solutionSumed, testcaseSumList[tcIndex]]
            else:
                finalexec = [solutionSumed, Qinfo["Tester"], testcaseSumList[tcIndex]]

            output = StringIO()

            with stopit.ThreadingTimeout(timeout) as context_manager:
                with redirect_stdout(output):
                    exec("\n\n".join(finalexec), {})

            results = [""]
            if context_manager.state != context_manager.TIMED_OUT:
                # return True, f"This submittion have stuck in loop that run longer than {timeout} seconds"
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

    # score = []
    # num = 0
    # for solIndex in range(len(solution)):
    #     temp_max_p = 0
    #     temp_cor_p = 0
    #     for test in Qinfo["Testcase"][solIndex]:
    #         temp_max_p += Qinfo["Points"][num]
    #         try:
    #             if(Qinfo["TesterLoc"] == 0):
    #                 finalexec = [Qinfo["Tester"], solution[solIndex], test]
    #             else:
    #                 finalexec = [solution[solIndex], Qinfo["Tester"], test]

    #             output = StringIO()

    #             with stopit.ThreadingTimeout(timeout) as context_manager:
    #                 with redirect_stdout(output):
    #                     exec("\n\n".join(finalexec), {})

    #             results = [""]
    #             if context_manager.state != context_manager.TIMED_OUT:
    #                 # return True, f"This submittion have stuck in loop that run longer than {timeout} seconds"
    #                 results = output.getvalue().strip("\n").split("\n")
    #             isPass = True
    #             for result in results:
    #                 if(result != check_keyword):
    #                     isPass = False
    #                     break
    #             if(isPass): temp_cor_p += Qinfo["Points"][num]

    #         except Exception as e:
    #             print(e)
    #             pass

    #         num += 1
    #     score.append([temp_cor_p, temp_max_p])
    # return False, score
