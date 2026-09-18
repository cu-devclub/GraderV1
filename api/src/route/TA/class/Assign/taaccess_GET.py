from function.db import get_db
from flask import request, jsonify
from function.isCET import isCET
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    try:
        identity = get_jwt_identity()
        Email = identity['email']
        Role = str(identity.get('role', '1'))
        
        if Role != '2':
            return jsonify({'success': False, 'msg': "You don't have permission."}), 200

        conn = get_db()
        cursor = conn.cursor()
        
        LID = request.args.get("LID")
        CSYID = request.args.get("CSYID")

        if not isCET(conn, cursor, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission."}), 200

        query = """
            SELECT u.Email, u.UID, u.Name
            FROM user u
            JOIN classeditor ce ON u.Email = ce.Email
            WHERE ce.CSYID = %s AND u.Role = '1'
        """
        cursor.execute(query, (CSYID,))
        tas = cursor.fetchall()

        query = """
            SELECT Email
            FROM taexamaccess
            WHERE LID = %s
        """
        cursor.execute(query, (LID,))
        access = cursor.fetchall()
        access_emails = [a[0] for a in access]

        data = []
        for ta in tas:
            data.append({
                'Email': ta[0],
                'UID': ta[1],
                'Name': ta[2],
                'Access': ta[0] in access_emails
            })

        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500
