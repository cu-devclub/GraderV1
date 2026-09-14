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
                    WHEN CO.UID IS NOT NULL AND CO.`LID` = LB.`LID` THEN 0 
                    ELSE 1 
                END AS checkedOut
            FROM 
                student STD
            JOIN 
                user USR ON USR.UID = STD.UID
            LEFT JOIN 
                checkout CO ON CO.UID = STD.UID AND CO.CSYID = STD.CSYID
            JOIN 
                lab LB ON LB.CSYID = STD.CSYID
            WHERE 
                LB.LID = %s
                AND (JSON_CONTAINS(LB.CID, CAST(STD.CID AS JSON)) 
                    OR JSON_CONTAINS(LB.GID, CAST(STD.GID AS JSON)));
            """
        cursordict.execute(query, (LID,))
        STDL = cursordict.fetchall()
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