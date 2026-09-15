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
            return jsonify({'success': False, 'msg': "Missing required fields"}), 400

        conn = get_db()
        cur = conn.cursor()

        if not isCET(conn, cur, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission"}), 403

        cur.execute("SELECT GID FROM `group` WHERE CSYID=%s AND `Group`=%s", (CSYID, Group))
        group_data = cur.fetchone()
        if not group_data:
            return jsonify({'success': False, 'msg': "Group not found"}), 404
            
        GID = group_data[0]

        # Ensure group is empty before delete
        cur.execute("SELECT COUNT(*) FROM student WHERE GID=%s", (GID,))
        student_count = cur.fetchone()[0]
        if student_count > 0:
            return jsonify({'success': False, 'msg': "Group must be empty before delete"}), 400

        cur.execute("DELETE FROM `group` WHERE GID=%s", (GID,))
        conn.commit()

        return jsonify({'success': True, 'msg': "Group deleted successfully"})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500
