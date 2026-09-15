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
            return jsonify({'success': False, 'msg': "Missing CSYID or Section"}), 400

        conn = get_db()
        cur = conn.cursor()

        if not isCET(conn, cur, Email, CSYID):
            return jsonify({'success': False, 'msg': "You don't have permission"}), 403

        cur.execute("SELECT CID FROM section WHERE CSYID=%s AND Section=%s", (CSYID, Section))
        if cur.fetchone():
            return jsonify({'success': False, 'msg': "Section already exists"}), 400

        cur.execute("INSERT INTO section (CSYID, Section) VALUES (%s, %s)", (CSYID, Section))
        conn.commit()

        return jsonify({'success': True, 'msg': "Section created successfully"})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500
