import json

import function.grader as grader
from function.gradeInBackground import gradeInBackground
from function.loadconfig import executor

def regrade(conn, cursor, isSourceUpdate: bool, QID, LID):
    if QID == None:
        cursor.execute("SELECT QID FROM `question` WHERE LID = %s", (LID))
        for i in cursor.fetchall():
            regrade(conn, cursor, isSourceUpdate, i[0], LID)
        return

    select_query = "SELECT Path FROM addfile WHERE LID = %s"
    cursor.execute(select_query, (LID,))
    result = cursor.fetchall()

    addfiles = [row[0] for row in result]

    # # ADF update but source
    # if not isSourceUpdate:
    query = "SELECT SourcePath FROM `question` WHERE `QID`=%s"
    cursor.execute(query, (QID,))
    result = cursor.fetchone()
    source_path = result[0]

    Qinfo = grader.QinfoGenerate(source_path, addfile=addfiles)
    Qinfo_query = "UPDATE `question` SET `Qinfo`=%s WHERE `QID`=%s"
    cursor.execute(Qinfo_query, (json.dumps(Qinfo), QID))
    conn.commit()

    select_query = """
        SELECT 
            `UID`,
            `SummitedFile`,
            `Timestamp`,
            `OriginalName`,
            `CSYID`
        FROM 
            `submitted` 
        WHERE
            QID = %s
    """
    cursor.execute(select_query, (QID))
    result = cursor.fetchall()

    cursor.execute('''
        SELECT MaxScore
        FROM question
        WHERE QID = %s AND LID = %s
    ''', (QID, LID))
    MSC = cursor.fetchone()
    if not MSC:
        return
    max_score = MSC[0] 

    for UID, filepath, timestamp, OriginalFileName, CSYID in result:
        executor.submit(gradeInBackground, source_path, addfiles, filepath, QID, max_score, UID, LID, timestamp, CSYID, OriginalFileName, Qinfo)