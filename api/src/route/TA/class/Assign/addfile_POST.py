import os
from flask import request, jsonify

from function.db import get_db
from function.loadconfig import UPLOAD_FOLDER
from function.isCET import isCET
from function.regrade import regrade

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = get_db()
    cursor = conn.cursor()

    form = request.form

    CSYID = form.get("CSYID")

    if not isCET(conn, cursor, Email, CSYID):
        return jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200

    try:
        LID = form.get('LID')
        if len(request.files) < 1:
            return jsonify({
                'success': False,
                'msg': "Invalid request.",
                'data': {}
            }), 200

        files = [v for _, v in request.files.items()]

        cursor.execute("SELECT Path FROM `addfile` WHERE LID = %s", (LID))
        dbfilesFetch = cursor.fetchall()
        dbFiles = [os.path.split(i[0])[-1] for i in dbfilesFetch] if dbfilesFetch else []

        AddDirec = os.path.join(UPLOAD_FOLDER, CSYID, LID)
        if not os.path.exists(AddDirec):
            os.makedirs(AddDirec)

        for f in files:
            AddPath = os.path.join(AddDirec, f.filename)

            if f.filename not in dbFiles:
                addFile = "INSERT INTO addfile (LID, Path, CSYID) VALUES (%s, %s, %s)"
                cursor.execute(addFile, (LID, AddPath, CSYID))
                conn.commit()

            f.save(AddPath)

        regrade(conn, cursor, False, None, LID)

        return jsonify({
            'success': True,
            'msg': '',
            'data': ''
        }), 200

    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': e
        }), 200