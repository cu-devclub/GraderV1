from flask import request, jsonify

from function.db import get_db
from function.isCET import isCET

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = get_db()
    cursor = conn.cursor()
    
    form = request.get_json()
    LID = form.get("LID")

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
        sql = "DELETE FROM checkout WHERE LID = %s"
        cursor.execute(sql, (LID,))
        cursor.execute("DELETE FROM ticket WHERE LID = %s;", (LID,))
        conn.commit()

        return jsonify({
            'success': True,
            'msg': '',
            'data': {}
        }), 200
    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': str(e)
        }), 500
