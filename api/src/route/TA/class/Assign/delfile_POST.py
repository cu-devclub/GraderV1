import os
import base64
import json
from flask import request, jsonify

from function.db import get_db
from function.isCET import isCET
from function.checkPermAddDown import checkPermAddDown

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']

    data = request.get_json()
    fileRequest = data.get('fileRequest')

    conn = get_db()
    cur = conn.cursor()

    try:
        fileRequest = int(fileRequest)
    except Exception:
        return jsonify({
            'success': False,
            'msg': 'fileRequest is not valid',
            'data': ""
        }), 200
    
    if not isCET(conn, cur, Email, data.get("CSYID")):
        jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200
    
    if not checkPermAddDown(fileRequest, Email, cur):
        return jsonify({
            'success': False,
            'msg': 'You do not have access to this file.',
            'data': ""
        }), 200
    

    cur.execute("DELETE FROM addfile WHERE ID = %s", (fileRequest,))
    conn.commit()

    
    return jsonify({
        'success': True,
        'msg': '',
        'data': ""
    })
