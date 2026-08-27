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

    LID = request.args.get('LID')
    if not LID:
        return jsonify({
            'success': False,
            'msg': 'LID is required',
            'data': {}
        }), 400

    query = """ 
        SELECT
            LB.CSYID
        FROM
            lab LB
        WHERE 
            LB.LID = %s
        """
    cursor.execute(query, (LID,))
    data = cursor.fetchone()
    
    if data is None:
        return jsonify({
            'success': False,
            'msg': "Lab not found",
            'data': {}
        }), 200

    if not isCET(conn, cursor, Email, data[0]):
        return jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200


    try:
        # Get lab details
        query = """
            SELECT
                LB.CID,
                LB.GID,
                LB.Due
            FROM
                lab LB
            WHERE 
                LB.LID = %s
        """
        cursor.execute(query, (LID,))
        lab_details = cursor.fetchone()
        if not lab_details:
            return jsonify({
                'success': False,
                'msg': 'Lab not found',
                'data': {}
            }), 404

        CID_list = json.loads(lab_details[0]) if lab_details[0] else []
        GID_list = json.loads(lab_details[1]) if lab_details[1] else []
        due_date = lab_details[2]

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

        all_max_score = sum([int(q[1]) for q in questions])

        # Get students
        cid_condition = "ST.CID IN (%s)" % ','.join(map(str, CID_list)) if CID_list else "1=0"
        gid_condition = "ST.GID IN (%s)" % ','.join(map(str, GID_list)) if GID_list else "1=0"

        query = f"""
            SELECT ST.UID, US.Name, COALESCE(SUM(SMT.Score), 0) AS AllScore
            FROM student ST
            JOIN user US ON ST.UID = US.UID
            LEFT JOIN submitted SMT ON ST.UID = SMT.UID AND (SMT.LID = %s OR SMT.QID IN (SELECT QID FROM question WHERE LID = %s))
            WHERE {cid_condition} OR {gid_condition}
            GROUP BY ST.UID, US.Name
            ORDER BY ST.UID ASC
        """
        cursor.execute(query, (LID, LID))
        students = cursor.fetchall()

        student_data = []
        for student in students:
            UID, Name, all_score = student
            student_data.append({
                "AllScore": "{:.2f}".format(all_score),
                "Name": Name,
                "UID": UID
            })

        return jsonify({
            'success': True,
            'msg': '',
            'data': {
                'Students': student_data,
                'AllMaxScore': int(all_max_score)
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