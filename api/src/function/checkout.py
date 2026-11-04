import pytz
from datetime import datetime

from function.isOtherIPCheckedOut import isOtherIPCheckedOut

OTHER_DEVICE_MSG = "Student is already checked in from another device. Check the student out first."

def checkout(conn, cursor, CSYID, UID, LID, switch_device=False) -> str:
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
                ID,
                ip
            FROM
                ticket
            WHERE 
                UID = %s AND LID = %s AND CSYID = %s AND Type = 1
        """

        cursor.execute(query, (UID, LID, CSYID))
        data = cursor.fetchone()
        # check-in is bound to the student's IP, so it must come from the student's own ticket
        if data is None:
            return "No check-in ticket found. The student must request check-in from their own device."

        public_ip = data[1]
        now = datetime.now(pytz.timezone('Asia/Bangkok'))
        # only one IP per UID is allowed in exam mode
        if isOtherIPCheckedOut(cursor, UID, LID, public_ip):
            if not switch_device:
                return OTHER_DEVICE_MSG
            # switching device: check out the old device (soft delete) before checking in this one
            query = "UPDATE `checkout` SET `CheckoutTime` = %s WHERE UID = %s AND LID = %s AND CSYID = %s AND `CheckoutTime` IS NULL;"
            cursor.execute(query, (now, UID, LID, CSYID))

        query = "DELETE FROM ticket WHERE ID = %s;"
        cursor.execute(query, (data[0]))
        conn.commit()

        event_name = f"delete_event_{data[0]}"
        query = f"DROP EVENT IF EXISTS {event_name};"
        cursor.execute(query)
        conn.commit()

        query = "INSERT INTO `checkout` (`UID`, `LID`, `CSYID`, ip, `Timestamp`) VALUES (%s, %s, %s, %s, %s);"
        cursor.execute(query, (UID, LID, CSYID, public_ip, now))
        conn.commit()

    except Exception as e:
        return str(e)
    return None