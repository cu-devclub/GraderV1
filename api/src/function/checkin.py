def checkin(conn, cursor, CSYID, UID, LID) -> str:
    try:
        query = """ 
        SELECT
            LB.CSYID
        FROM
            lab LB
        WHERE 
            LB.LID = %s
        """
        cursor.execute(query, (LID,))
        data = cursor.fetchone()
    
        if data is None:
            return "Lab not found."
        
        query = """ 
            SELECT
                ID
            FROM
                ticket
            WHERE 
                UID = %s AND LID = %s AND CSYID = %s AND Type = 0
        """

        cursor.execute(query, (UID, LID, CSYID))
        data = cursor.fetchone()
        if data is not None:
            query = "DELETE FROM ticket WHERE ID = %s;"
            cursor.execute(query, (data[0]))
            conn.commit()

            event_name = f"delete_event_{data[0]}"
            query = f"DROP EVENT IF EXISTS {event_name};"
            cursor.execute(query)
            conn.commit()

        query = "DELETE FROM `checkout` WHERE UID = %s AND LID = %s AND CSYID = %s;"
        cursor.execute(query, (UID, LID, CSYID))
        conn.commit()

    except Exception as e:
        return str(e)
    return None