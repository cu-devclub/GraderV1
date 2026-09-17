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
        OldSection = Data.get("OldSection")
        NewSection = Data.get("NewSection")

        if CSYID is None or OldSection is None or NewSection is None:
            return jsonify({'success': False, 'msg': "Missing required fields"}), 400

        conn = get_db()
        cur = conn.cursor()

        if not isCET(conn, cur, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission"}), 403

        # Check if NewSection already exists
        cur.execute("SELECT CID FROM section WHERE CSYID=%s AND Section=%s", (CSYID, NewSection))
        if cur.fetchone():
            return jsonify({'success': False, 'msg': "New Section name already exists"}), 400

        cur.execute("UPDATE section SET Section=%s WHERE CSYID=%s AND Section=%s", (NewSection, CSYID, OldSection))
        if cur.rowcount == 0:
            return jsonify({'success': False, 'msg': "Section not found"}), 404
            
        conn.commit()

        return jsonify({'success': True, 'msg': "Section updated successfully"})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500
