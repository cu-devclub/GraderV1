from flask import request, jsonify, g
from function.db import get_db
from function.isCET import isCET
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    try:
        Email = get_jwt_identity()['email']
        Data = request.get_json()
        CSYID = Data.get("CSYID")
        Group = Data.get("Group")

        if CSYID is None or Group is None:
            return jsonify({'success': False, 'msg': "Missing CSYID or Group"}), 400

        conn = get_db()
        cur = conn.cursor()

        if not isCET(conn, cur, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission"}), 403

        cur.execute("SELECT GID FROM `group` WHERE CSYID=%s AND `Group`=%s", (CSYID, Group))
        if cur.fetchone():
            return jsonify({'success': False, 'msg': "Group already exists"}), 400

        cur.execute("INSERT INTO `group` (CSYID, `Group`) VALUES (%s, %s)", (CSYID, Group))
        conn.commit()

        return jsonify({'success': True, 'msg': "Group created successfully"})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500
