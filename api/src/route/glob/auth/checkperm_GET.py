from flask import jsonify, request, g

from function.db import get_db
from function.isCET import isCET

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    email = get_jwt_identity()['email']
    csyid = request.args.get('CSYID')
    id = request.args.get('ID')

    conn = get_db()
    cursor = conn.cursor()

    if (csyid == "null" and id == "null") or (not csyid and not id):
        return jsonify({
            'success': False,
            'msg': '',
            'data': {}
        }), 200  

    if csyid == "null" or not csyid:
        sql = "SELECT CSYID FROM ticket WHERE ID = %s"
        cursor.execute(sql, (id))
        cs = cursor.fetchone()
        if not cs:
            return jsonify({
                'success': False,
                'msg': '',
                'data': {}
            }), 200 
        csyid = cs[0]


    return jsonify({
        'success': isCET(conn, cursor, email, csyid),
        'msg': '',
        'data': {}
    }), 200