import json
import pytz
from datetime import datetime
from flask import request, jsonify

from function.db import get_db
from function.examRule import ruleHash, normalizeName

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    UID = Email.split('@')[0]

    data = request.get_json()
    LID = data.get('LID')
    Ack = data.get('Ack') is True
    Name = data.get('Name')
    RuleHash = data.get('RuleHash')

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("SELECT l.Exam, l.ExamRule, l.CID, l.GID, l.CSYID FROM lab l WHERE l.LID = %s", (LID,))
        lab_row = cur.fetchone()
        if not lab_row:
            return jsonify({
                'success': False,
                'msg': 'Lab not found.',
                'data': ""
            }), 200

        isExam, exam_rule, lab_cids, lab_gids, CSYID = lab_row
        if not isExam or not (exam_rule or "").strip():
            return jsonify({
                'success': False,
                'msg': 'This lab has no exam rule to acknowledge.',
                'data': ""
            }), 200

        # Only students of this lab can acknowledge
        cur.execute("SELECT CID, GID FROM student WHERE UID = %s AND CSYID = %s", (UID, CSYID))
        student_row = cur.fetchone()
        is_accessible = False
        if student_row:
            student_cid, student_gid = student_row
            try:
                is_accessible = student_cid in json.loads(lab_cids or "[]")
            except Exception:
                is_accessible = False
            if not is_accessible:
                try:
                    is_accessible = student_gid in json.loads(lab_gids or "[]")
                except Exception:
                    is_accessible = False

        if not is_accessible:
            return jsonify({
                'success': False,
                'msg': 'You do not have access to this lab.',
                'data': ""
            }), 200

        # the student must acknowledge the version they were shown
        current_hash = ruleHash(exam_rule)
        if RuleHash != current_hash:
            return jsonify({
                'success': False,
                'msg': 'The exam rules were updated. Please reload the page and read them again.',
                'data': ""
            }), 200

        if not Ack:
            return jsonify({
                'success': False,
                'msg': 'Please tick the box to acknowledge the exam rules.',
                'data': ""
            }), 200

        cur.execute("SELECT Name FROM user WHERE Email = %s", (Email,))
        user_row = cur.fetchone()
        if not user_row or normalizeName(Name) != normalizeName(user_row[0]):
            return jsonify({
                'success': False,
                'msg': 'The typed name does not match your name.',
                'data': ""
            }), 200

        now = datetime.now(pytz.timezone('Asia/Bangkok'))
        cur.execute(
            """
                INSERT INTO examruleack (LID, UID, RuleHash, `Timestamp`) VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE RuleHash = VALUES(RuleHash), `Timestamp` = VALUES(`Timestamp`)
            """,
            (LID, UID, current_hash, now)
        )
        conn.commit()

        return jsonify({
            'success': True,
            'msg': 'Success',
            'data': ""
        }), 200
    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': str(e)
        }), 500
