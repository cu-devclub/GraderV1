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
        Section = Data.get("Section")

        if CSYID is None or Section is None:
            return jsonify({'success': False, 'msg': "Missing required fields"}), 400

        conn = get_db()
        cur = conn.cursor()

        if not isCET(conn, cur, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission"}), 403

        cur.execute("SELECT CID FROM section WHERE CSYID=%s AND Section=%s", (CSYID, Section))
        section_data = cur.fetchone()
        if not section_data:
            return jsonify({'success': False, 'msg': "Section not found"}), 404
            
        CID = section_data[0]

        # Ensure section is empty before delete
        cur.execute("SELECT COUNT(*) FROM student WHERE CID=%s", (CID,))
        student_count = cur.fetchone()[0]
        if student_count > 0:
            return jsonify({'success': False, 'msg': "Section must be empty before delete"}), 400

        cur.execute("DELETE FROM section WHERE CID=%s", (CID,))
        conn.commit()

        return jsonify({'success': True, 'msg': "Section deleted successfully"})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500
