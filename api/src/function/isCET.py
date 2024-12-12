def isCET(db, cursor, Email, CSYID, FID=None):
    try:
        if FID is not None:
            query_addfile = "SELECT CSYID FROM addfile WHERE ID = %s"
            cursor.execute(query_addfile, (FID,))
            result_addfile = cursor.fetchone()
            
            if not result_addfile:
                return False
            
            CSYID = result_addfile[0]
        query = """
            SELECT 
                id
            FROM 
                classeditor
            WHERE 
                Email = %s AND CSYID = %s 
        """
        cursor.execute(query,(Email, CSYID))
        row = cursor.fetchone()
        return row != None
    except Exception as e:
        db.rollback()
        return False