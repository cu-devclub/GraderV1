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
        
        data = request.json
        LID = data.get("LID")
        CSYID = data.get("CSYID")
        target_email = data.get("Email")
        access = data.get("Access")

        if not isCET(conn, cursor, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission."}), 200

        if access:
            query = "INSERT IGNORE INTO taexamaccess (LID, Email) VALUES (%s, %s)"
            cursor.execute(query, (LID, target_email))
        else:
            query = "DELETE FROM taexamaccess WHERE LID = %s AND Email = %s"
            cursor.execute(query, (LID, target_email))
        
        conn.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'msg': str(e)}), 500
