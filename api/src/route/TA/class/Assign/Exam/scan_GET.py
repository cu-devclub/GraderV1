from flask import request, jsonify

from function.db import get_db
from function.isCET import isCET

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = get_db()
    cursor = conn.cursor()
    
    CSYID = request.args.get("CSYID")
    ID = request.args.get("ID")

    if ID is None:
        return jsonify({
            'success': False,
            'msg': "Invalid request",
            'data': {}
        }), 200

    if CSYID is None or CSYID == "null":
        query = """ 
            SELECT
                CSYID
            FROM
                ticket
            WHERE 
                ID = %s;
            """
        cursor.execute(query, (ID,))
        cs = cursor.fetchone()
        if cs is None:
            return jsonify({
                'success': False,
                'msg': "Invalid request",
                'data': {}
            }), 200
        CSYID = cs[0]
    
    

    if not isCET(conn, cursor, Email, CSYID):
        return jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200

    try:
        query = """ 
            SELECT 
                TKT.UID, 
                USR.Name, 
                CONCAT('Lab ', LB.Lab, ' ', LB.Name) AS Lab,
                TKT.Type,
                LB.LID,
                TKT.CSYID
            FROM
                ticket TKT
            JOIN 
                user USR ON USR.UID = TKT.UID
            JOIN 
                lab LB ON LB.LID = TKT.LID
            WHERE 
                TKT.ID = %s;
            """
        cursor.execute(query, (ID,))
        rqtinfo = cursor.fetchone()
        if rqtinfo is None:
            return jsonify({
                'success': False,
                'msg': "Invalid QRCode try recreate QRCode",
                'data': {}
            }), 200

        return jsonify({
            'success': True,
            'msg': '',
            'data': {
                "UID": rqtinfo[0],
                "Name": rqtinfo[1],
                "Lab": rqtinfo[2],
                "Type": rqtinfo[3],
                "LID": rqtinfo[4],
                "CSYID": rqtinfo[5]
            }
        }), 200
    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': str(e)
        }), 500