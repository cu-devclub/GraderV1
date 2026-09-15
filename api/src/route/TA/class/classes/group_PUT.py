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
        OldGroup = Data.get("OldGroup")
        NewGroup = Data.get("NewGroup")

        if CSYID is None or OldGroup is None or NewGroup is None:
            return jsonify({'success': False, 'msg': "Missing required fields"}), 400

        conn = get_db()
        cur = conn.cursor()

        if not isCET(conn, cur, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission"}), 403

        # Check if NewGroup already exists
        cur.execute("SELECT GID FROM `group` WHERE CSYID=%s AND `Group`=%s", (CSYID, NewGroup))
        if cur.fetchone():
            return jsonify({'success': False, 'msg': "New Group name already exists"}), 400

        cur.execute("UPDATE `group` SET `Group`=%s WHERE CSYID=%s AND `Group`=%s", (NewGroup, CSYID, OldGroup))
        if cur.rowcount == 0:
            return jsonify({'success': False, 'msg': "Group not found"}), 404
            
        conn.commit()

        return jsonify({'success': True, 'msg': "Group updated successfully"})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500
