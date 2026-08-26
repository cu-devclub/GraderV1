import json
from datetime import datetime

from flask import request, jsonify, g
from function.isCET import isCET

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = g.db
    cursor = conn.cursor()

    UID = request.args.get('UID')
    LID = request.args.get('LID')

    if not UID or not LID:
        return jsonify({
            'success': False,
            'msg': 'UID and LID are required',
            'data': {}
        }), 400

    query = """ 
        SELECT
            LB.CSYID,
            LB.Due
        FROM
            lab LB
        WHERE 
            LB.LID = %s
        """
    cursor.execute(query, (LID,))
    lab_data = cursor.fetchone()
    
    if lab_data is None:
        return jsonify({
            'success': False,
            'msg': "Lab not found",
            'data': {}
        }), 200

    CSYID, due_date = lab_data

    if not isCET(conn, cursor, Email, CSYID):
        return jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200

    try:
        # Get questions
        query = """
            SELECT QST.QID, QST.MaxScore
            FROM question QST
            WHERE QST.LID = %s
            ORDER BY QST.QID ASC
        """
        cursor.execute(query, (LID,))
        questions = cursor.fetchall()
        if not questions:
            return jsonify({
                'success': False,
                'msg': 'No questions found for the lab',
                'data': {}
            }), 404

        # Get submissions for this student and lab
        query = """
            SELECT QID, Score, Timestamp, SID
            FROM submitted
            WHERE UID = %s AND LID = %s
        """
        cursor.execute(query, (UID, LID))
        submission_rows = cursor.fetchall()
        submissions = {row[0]: (row[1], row[2], row[3]) for row in submission_rows}

        student_smt = []
        all_score = 0

        for question in questions:
            QID, MaxScore = question
            sub = submissions.get(QID)

            score = sub[0] if sub and sub[0] is not None else 0
            timestamp = sub[1] if sub else None
            SID = sub[2] if sub and sub[2] is not None else -1

            if timestamp:
                timestamp_str = timestamp.strftime("%d/%m/%Y %H:%M")
                late = (timestamp > due_date) if due_date else False
            else:
                timestamp_str = "-"
                late = (datetime.now() > due_date) if due_date else False

            student_smt.append({
                "Time": timestamp_str,
                "Late": late,
                "Score": "{:.2f}".format(score),
                "MaxScore": int(MaxScore),
                "SID": SID
            })
            all_score += score

        return jsonify({
            'success': True,
            'msg': '',
            'data': {
                'SMT': student_smt,
                'AllScore': "{:.2f}".format(all_score),
                'UID': UID
            }
        }), 200

    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': str(e)
        }), 500
