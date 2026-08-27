import json
import sys
import function.grader as grader
from function.db import get_puredb


def gradeInBackground(Source, addfiles, filepath, QID, MaxScore, UID, LID, upload_time, CSYID, OriginalFileName, Qinfo):
    try:
        conn = get_puredb()
        cursor = conn.cursor()
        if Qinfo is None:
            Qinfo = grader.QinfoGenerate(Source, addfile=addfiles)
            Qinfo_query = "UPDATE `question` SET `Qinfo`=%s WHERE `QID`=%s"
            cursor.execute(Qinfo_query, (json.dumps(Qinfo), QID))
            conn.commit()
    
        print(f"Grading UID: {UID}, LID: {LID}, QID: {QID}, File: {filepath}")
        sys.stdout.flush()
        err, data = grader.grade(Source, filepath, addfile=addfiles, validate=False, check_keyword="ok", timeout=2, Qinfo=Qinfo)
        if err:
            print(f"grade error UID: {UID}, LID: {LID}, QID: {QID}: {data}")
            data = [[0, 1]]
    
        print(f"grade result UID: {UID}, LID: {LID}, QID: {QID}: {err} {data}")
        sys.stdout.flush()
        
        s, m = 0, 0
    
        if len(data) == 1:
            s += float(data[0][0])  # Ensure data is converted to float
            m += float(data[0][1])  # Ensure data is converted to float
        else:
            for j in range(len(data)):
                s += float(data[j][0])  # Ensure data is converted to float
                m += float(data[j][1])  # Ensure data is converted to float
    
        # Check if m is zero to avoid division by zero
        if m == 0:
            Score = 0
        else:
            Score = float("{:.2f}".format((s / m) * float(MaxScore)))  # Ensure MaxScore is converted to float
    
        # Define the insert or update query
        upsert_query = """
            INSERT INTO submitted (UID, LID, QID, SummitedFile, Score, Timestamp, CSYID, OriginalName)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                SummitedFile = VALUES(SummitedFile),
                Score = VALUES(Score),
                Timestamp = VALUES(Timestamp),
                OriginalName = VALUES(OriginalName)
        """
    
        # Execute the query with the provided values
        cursor.execute(upsert_query, (UID, LID, QID, filepath, Score, upload_time, CSYID, OriginalFileName))
        conn.commit()
    except Exception as e:
        print(f"Error in gradeInBackground UID: {UID}, LID: {LID}, QID: {QID}: {e}")
        sys.stdout.flush()
    finally:
        if 'conn' in locals() and conn:
            try:
                conn.close()
            except Exception:
                pass
    return
