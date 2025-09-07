from function.isLock import isLock

def isAccess(con, cur, ip, UID=None, Email:str=None, LID=None, QID=None, FID=None, SID=None):
    if not (UID or Email):
        return False
    if not (LID or QID, FID, SID):
        return False
    
    if not UID:
        UID = Email.split("@")[0]

    if not LID:
        if QID:
            cur.execute("""
                SELECT 
                    LID
                FROM question
                WHERE QID = %s
            """, (QID,))
            LID = cur.fetchone()[0]
        elif FID:
            cur.execute("""
                SELECT 
                    LID
                FROM addfile
                WHERE ID = %s
            """, (FID,))
            LID = cur.fetchone()[0]
        else:
            cur.execute("""
                SELECT 
                    LID
                FROM submitted
                WHERE SID = %s
            """, (SID,))
            LID = cur.fetchone()[0]
    
    cur.execute("""
        SELECT 
            Exam
        FROM lab
        WHERE LID = %s
    """, (LID,))
    lab_info_row = cur.fetchone()

    lock = isLock(con, cur, LID)

    if bool(int(lab_info_row[0])):
        que = """
        SELECT 
            CASE 
                WHEN EXISTS (
                    SELECT 1
                    FROM checkout
                    WHERE UID = %s AND LID = %s AND ip = %s
                ) 
                THEN 0
                ELSE 1 
            END AS access;
        """
        cur.execute(que, (UID, LID, ip))
        # Fetch access result
        data = cur.fetchone()

        if (bool(int(data[0])) or lock):
            return False
    return True