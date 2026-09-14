import os
import io
import zipfile
import base64
import json
from flask import request, jsonify

from function.isCET import isCET
from function.db import get_db

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']

    data = request.get_json()
    LID = data.get('LID')

    conn = get_db()
    cur = conn.cursor()

    query = """ 
        SELECT
            LB.CSYID,
            CLS.ClassID
        FROM
            lab LB
            LEFT JOIN class CLS ON CLS.CSYID = LB.CSYID
        WHERE 
            LB.LID = %s
        """
    cur.execute(query, (LID,))
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
    
    # Get all additional files
    cur.execute("SELECT SummitedFile from `submitted` WHERE LID = %s", (LID))
    subf = cur.fetchall()

    zip_buffer = io.BytesIO()

    # Get lab number
    cur.execute("SELECT Lab from `lab` WHERE LID = %s", (LID))
    lab = cur.fetchone()
    if not lab:
        return jsonify({
            'success': False,
            'msg': 'lab is invalid.',
            'data': ""
        }), 200
    LN = lab[0]

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add all aditional files
        for file_path in subf:
            with open(file_path[0], "rb") as f:
                zip_file.writestr(os.path.join("Question_" + file_path[0][-7], os.path.split(file_path[0])[-1]), f.read())


    zip_buffer.seek(0)

    # Get the raw bytes of the zip file
    zip_file_content = zip_buffer.getvalue()

    # Encode the zip file content to base64
    encoded_file_content = base64.b64encode(zip_file_content).decode('utf-8')

    response_data = {
        'success': True,
        'fileContent': encoded_file_content,
        'fileType': "application/octet-stream",
        'downloadFilename': f'{str(data[1]).replace(".", "-")}_Lab-{LN}.zip'
    }
    
    return jsonify(response_data)