import os
import base64
from flask import request, jsonify

from function.isCET import isCET
from function.db import get_db

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']

    data = request.get_json()
    SID = data.get('SID')

    conn = get_db()
    cur = conn.cursor()

    query = """ 
        SELECT
            SM.CSYID,
            SM.SummitedFile
        FROM
            `submitted` SM
        WHERE 
            SM.SID = %s
        """
    cur.execute(query, (SID,))
    data = cur.fetchone()
    
    if data is None:
        return jsonify({
            'success': False,
            'msg': "Lab not found",
            'data': {}
        }), 200


    if not isCET(conn, cur, Email=Email, CSYID=data[0]):
        return jsonify({
            'success': False,
            'msg': 'You do not have access to this file.',
            'data': ""
        }), 200
    
    file_content = ""
    # Read the file content
    with open(data[1], "rb") as file:
        file_content = file.read()

    filename = os.path.split(data[1])[-1]

    encoded_file_content = base64.b64encode(file_content).decode('utf-8')

    response_data = {
        'success': True,
        'fileContent': encoded_file_content,
        'fileType': "application/octet-stream",
        'downloadFilename': filename
    }
    
    return jsonify(response_data)