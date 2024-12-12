import os
import io
import zipfile
import base64
import json
from flask import request, jsonify

from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization

from function.isAccess import isAccess
from function.loadconfig import config
from function.db import get_db

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']

    data = request.get_json()
    LID = data.get('LID')

    conn = get_db()
    cur = conn.cursor()

    if not isAccess(conn, cur, Email=Email, LID=LID):
        return jsonify({
            'success': False,
            'msg': 'You do not have access to this file.',
            'data': ""
        }), 200
    
    # Get all additional files
    cur.execute("SELECT Path from `addfile` WHERE LID = %s AND Hide = 0", (LID))
    adf = cur.fetchall()

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
        for file_path in adf:
            with open(file_path[0], "rb") as f:
                zip_file.writestr(os.path.split(file_path[0])[-1], f.read())

        # Add all question files
        cur.execute("SELECT ReleasePath, QID FROM `question` WHERE LID = %s", (LID))
        QFDB = cur.fetchall()
        for fl, QID in QFDB:
            prefilename = str(os.path.split(fl)[-1]).split("_")
            filename = f'{Email.split("@")[0]}-L{LN}-Q{int(prefilename[1]) + 1}.ipynb'

            file_content = ""
            with open(fl, "rb") as file:
                file_content = file.read()

            nb_edit = json.loads(file_content)
            public_key = serialization.load_pem_public_key(config["PUBKEY"].encode('utf-8'))
            encrypted = public_key.encrypt(
                bytes(f"{Email.split('@')[0]}_{LID}_{QID}", 'utf-8'),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            nb_edit["metadata"]["BondSan"] = encrypted.hex()
            file_content = bytes(json.dumps(nb_edit), 'utf-8')

            zip_file.writestr(filename, file_content)


    zip_buffer.seek(0)

    # Get the raw bytes of the zip file
    zip_file_content = zip_buffer.getvalue()

    # Encode the zip file content to base64
    encoded_file_content = base64.b64encode(zip_file_content).decode('utf-8')

    response_data = {
        'success': True,
        'fileContent': encoded_file_content,
        'fileType': "application/octet-stream",
        'downloadFilename': f'Lab_{LN}.zip'
    }
    
    return jsonify(response_data)