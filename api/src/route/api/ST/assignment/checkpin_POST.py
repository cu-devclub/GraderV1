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
import pytz
from datetime import datetime

@jwt_required()
def main():
    Email = get_jwt_identity()['email']

    data = request.get_json()
    LID = data.get('LID')
    Pin = data.get('Pin')
    public_ip = request.headers.get('X-Real-IP') or request.remote_addr
    # num_failed_attempt = 5

    conn = get_db()
    cur = conn.cursor()

    # check if lab is due
    tz = pytz.timezone('Asia/Bangkok')
    now = datetime.now(tz)

    cur.execute("SELECT l.Due, l.CID, l.GID, l.Exam, ep.Pin, l.CSYID, l.Publish FROM lab l LEFT JOIN exampin ep ON ep.LID = l.LID WHERE l.LID = %s", (LID,))
    lab_row = cur.fetchone()
    if not lab_row:
        return jsonify({
            'success': False,
            'msg': 'Lab not found.',
            'data': ""
        }), 200

    due, lab_cids, lab_gids, isExam, exam_pin, CSYID, publish = lab_row
    if not isExam:
        return jsonify({
            'success': False,
            'msg': 'Lab is not on examination mode.',
            'data': ""
        }), 200

    

    is_due_passed = False
    if due:
        is_due_passed = now > due.replace(tzinfo=tz)

    if is_due_passed:
        return jsonify({
            'success': False,
            'msg': 'Lab is due.',
            'data': ""
        }), 200

    # Column 2: True if lab contains CID and UID can link to student
    cur.execute("SELECT CID, GID FROM student WHERE UID = %s AND CSYID = %s", (Email.split('@')[0], CSYID,))
    student_row = cur.fetchone()
    is_accessible = False
    if student_row:
        student_cid, student_gid = student_row
        # Check if lab uses CID or GID
        if lab_cids:
            try:
                lab_cid_list = json.loads(lab_cids)
            except Exception:
                lab_cid_list = []
            is_accessible = student_cid in lab_cid_list

        if not is_accessible and lab_gids:
            try:
                lab_gid_list = json.loads(lab_gids)
            except Exception:
                lab_gid_list = []
            is_accessible = student_gid in lab_gid_list

    # check if lab is accessible
    if not is_accessible:
        return jsonify({
            'success': False,
            'msg': 'You do not have access to this lab.',
            'data': ""
        }), 200

    # check if user already check in (use isAccess)
    if isAccess(conn, cur, public_ip, Email=Email, LID=LID):
        return jsonify({
            'success': False,
            'msg': 'You already have access to this lab.',
            'data': ""
        }), 200
    
    # check if failed attemp reached limit
    cur.execute(
        "SELECT Attempt FROM pinattempt WHERE LID = %s AND UID = %s AND IP = %s",
        (LID, Email.split('@')[0], public_ip)
    )
    row = cur.fetchone()
    attempt_count = row[0] if row else 0
    # if attempt_count >= num_failed_attempt:
    #     return jsonify({
    #         'success': False,
    #         'msg': 'You have reached the maximum number of attempts.',
    #         'data': ""
    #     }), 200

    # check if pin cxorrect
    if Pin == exam_pin:
        query = "INSERT INTO `checkout` (`UID`, `LID`, `CSYID`, ip) VALUES (%s, %s, %s, %s);"
        cur.execute(query, (Email.split('@')[0], LID, CSYID, public_ip))
        conn.commit()
        return jsonify({
            'success': True,
            'msg': 'Success',
            'data': ""
        }), 200

    # Check if publish time is older than 30 minutes
    if publish:
        time_diff = (now - publish).total_seconds() / 60.0
        if time_diff > 30:
            return jsonify({
                'success': False,
                'msg': 'Pin is no longer available please use QR instead.',
                'data': ""
            }), 200

    # if not update attemp
    if attempt_count == 0:
        cur.execute(
            "INSERT INTO pinattempt (LID, UID, Attempt, IP, Timestamp) VALUES (%s, %s, %s, %s, %s)",
            (LID, Email.split('@')[0], 1, public_ip, now)
        )
    else:
        cur.execute(
            "UPDATE pinattempt SET Attempt = Attempt + 1, Timestamp = %s WHERE LID = %s AND UID = %s AND IP = %s",
            (now, LID, Email.split('@')[0], public_ip)
        )
    conn.commit()
    return jsonify({
        'success': False,
        'msg': 'Incorrect PIN.',
        'data': ""
    }), 200
