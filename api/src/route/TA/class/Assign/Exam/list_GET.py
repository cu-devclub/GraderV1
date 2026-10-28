from flask import request, jsonify

from function.db import get_db, get_dbdict
from function.isCET import isCET

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = get_db()
    cursor = conn.cursor()
    conndict = get_dbdict()
    cursordict = conndict.cursor()
    
    LID = request.args.get("LID")

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
        return jsonify({
            'success': False,
            'msg': "Lab not found",
            'data': {}
        }), 200

    if not isCET(conn, cursor, Email, data[0]):
        return jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200

    try:
        query = """ 
            SELECT 
                STD.UID, 
                USR.Name, 
                CASE
                    WHEN CO.ID IS NOT NULL AND CO.CheckoutTime IS NULL THEN 0
                    ELSE 1
                END AS checkedOut,
                CO.ip AS IP,
                CO.Timestamp AS CheckinTime,
                CO.CheckoutTime AS CheckoutTime
            FROM
                student STD
            JOIN
                user USR ON USR.UID = STD.UID
            JOIN
                lab LB ON LB.CSYID = STD.CSYID
            -- latest check-in record of this lab only (checked out or not), so each student appears once
            LEFT JOIN
                checkout CO ON CO.ID = (
                    SELECT MAX(C2.ID)
                    FROM checkout C2
                    WHERE C2.UID = STD.UID
                        AND C2.CSYID = STD.CSYID
                        AND C2.LID = LB.LID
                )
            WHERE
                LB.LID = %s
                AND (JSON_CONTAINS(LB.CID, CAST(STD.CID AS JSON))
                    OR JSON_CONTAINS(LB.GID, CAST(STD.GID AS JSON)));
            """
        cursordict.execute(query, (LID,))
        STDL = cursordict.fetchall()
        for row in STDL:
            for key in ('CheckinTime', 'CheckoutTime'):
                row[key] = row[key].strftime('%d/%m/%Y %H:%M:%S') if row[key] else None
        return jsonify({
            'success': True,
            'msg': '',
            'data': STDL
        }), 200
    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': str(e)
        }), 500