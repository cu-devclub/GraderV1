import os
import io
import zipfile
import base64
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
            LB.CSYID
        FROM
            lab LB
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
    cur.execute("SELECT Path from `addfile` WHERE LID = %s", (LID))
    adf = cur.fetchall()

    zip_buffer = io.BytesIO()

    # Get lab number
    cur.execute("SELECT LB.Lab, ClassID from `lab` LB LEFT JOIN class CLS ON CLS.CSYID = LB.CSYID  WHERE LID = %s", (LID))
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
        cur.execute("SELECT ReleasePath, SourcePath FROM `question` WHERE LID = %s", (LID))
        QFDB = cur.fetchall()
        if QFDB:
            for flr, fls in QFDB:
                prefilenamer = str(os.path.split(flr)[-1]).split("_")
                prefilenames = str(os.path.split(fls)[-1]).split("_")
                release = f'Release_{str(lab[1]).replace(".", "-")}_L{LN}_Q{int(prefilenamer[1]) + 1}.ipynb'
                source = f'Source_{str(lab[1]).replace(".", "-")}_L{LN}_Q{int(prefilenames[1]) + 1}.ipynb'

                file_content = ""
                with open(flr, "rb") as file:
                    file_content = file.read()

                zip_file.writestr(release, file_content)

                file_content = ""
                with open(fls, "rb") as file:
                    file_content = file.read()

                zip_file.writestr(source, file_content)


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