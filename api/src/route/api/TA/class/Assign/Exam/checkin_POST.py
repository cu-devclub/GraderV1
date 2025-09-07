from flask import request, jsonify

from function.db import get_db
from function.isCET import isCET
# from function.checkin import checkin
from function.checkout import checkout

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = get_db()
    cursor = conn.cursor()
    
    form = request.get_json()
    CSYID = form.get("CSYID")
    UID = form.get("UID")
    LID = form.get("LID")

    
    if CSYID is None or UID is None or LID is None:
        return jsonify({
            'success': False,
            'msg': "Invalid request",
            'data': "error"
        }), 200

    if not isCET(conn, cursor, Email, CSYID):
        return jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': "error"
        }), 200

    try:
        # err = checkin(conn, cursor, CSYID, UID, LID)
        err = checkout(conn, cursor, CSYID, UID, LID)
        if err is not None:
            return jsonify({
                'success': False,
                'msg': err,
                'data': "error"
            }), 200

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