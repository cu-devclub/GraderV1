import os
from flask import request, jsonify

from function.db import get_db
from function.isCET import isCET
from function.regrade import regrade


from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = get_db()
    cursor = conn.cursor()

    form = request.form

    if not isCET(conn, cursor, Email, form["CSYID"]):
        return jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200

    try:
        FID = form.get('ID')
        if len(request.files) != 1:
            return jsonify({
                'success': False,
                'msg': "Invalid request.",
                'data': {}
            }), 200
        file = list(request.files.items())[0][1]

        cursor.execute("SELECT Path, LID FROM `addfile` WHERE ID = %s", (FID))
        FP = cursor.fetchone()
        if not FP:
            return jsonify({
                'success': False,
                'msg': "ID not found.",
                'data': {}
            }), 200
        
        file.save(FP[0])

        regrade(conn, cursor, False, None, FP[1])

        return jsonify({
            'success': True,
            'msg': "Complete.",
            'data': {}
        }), 200
    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': e
        }), 200