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


    # try:
    #     # Get lab details
    #     query = """
    #         SELECT
    #             LB.CID,
    #             LB.GID,
    #             LB.Due
    #         FROM
    #             lab LB
    #         WHERE 
    #             LB.LID = %s
    #     """
    #     cursor.execute(query, (LID,))
    #     lab_details = cursor.fetchone()
    #     if not lab_details:
    #         return jsonify({
    #             'success': False,
    #             'msg': 'Lab not found',
    #             'data': {}
    #         }), 404

    #     CID_list = json.loads(lab_details[0]) if lab_details[0] else []
    #     GID_list = json.loads(lab_details[1]) if lab_details[1] else []
    #     due_date = lab_details[2]

    #     # Get questions
    #     query = """
    #         SELECT QST.QID, QST.MaxScore
    #         FROM question QST
    #         WHERE QST.LID = %s
    #         ORDER BY QST.QID ASC
    #     """
    #     cursor.execute(query, (LID,))
    #     questions = cursor.fetchall()
    #     if not questions:
    #         return jsonify({
    #             'success': False,
    #             'msg': 'No questions found for the lab',
    #             'data': {}
    #         }), 404

    #     all_max_score = sum([int(q[1]) for q in questions])

    #     # Get students
    #     cid_condition = "ST.CID IN (%s)" % ','.join(map(str, CID_list)) if CID_list else "1=0"
    #     gid_condition = "ST.GID IN (%s)" % ','.join(map(str, GID_list)) if GID_list else "1=0"

    #     query = f"""
    #         SELECT ST.UID, ST.CID, ST.GID, US.Name
    #         FROM student ST
    #         JOIN user US ON ST.UID = US.UID
    #         WHERE {cid_condition} OR {gid_condition}
    #     """
    #     cursor.execute(query)
    #     students = cursor.fetchall()

    #     student_data = []
    #     for student in students:
    #         UID, CID, GID, Name = student
    #         student_smt = []
    #         all_score = 0

    #         for question in questions:
    #             QID, MaxScore = question

    #             query = """
    #                 SELECT Score, Timestamp, SID
    #                 FROM submitted
    #                 WHERE UID = %s AND QID = %s AND LID = %s
    #             """
    #             cursor.execute(query, (UID, QID, LID))
    #             submission = cursor.fetchone()
    #             score = submission[0] if submission and submission[0] is not None else 0
    #             timestamp = submission[1] if submission else None
    #             SID = submission[2] if submission else -1

    #             if timestamp:
    #                 timestamp_str = timestamp.strftime("%d/%m/%Y %H:%M")
    #                 late = timestamp > due_date
    #             else:
    #                 timestamp_str = "-"
    #                 late = datetime.now() > due_date

    #             student_smt.append({
    #                 "Time": timestamp_str,
    #                 "Late": late,
    #                 "Score": "{:.2f}".format(score),
    #                 "MaxScore": int(MaxScore),
    #                 "SID": SID
    #             })
    #             all_score += score

    #         student_data.append({
    #             "UID": UID,
    #             "Name": Name,
    #             "SMT": student_smt,
    #             "AllScore": "{:.2f}".format(all_score)
    #         })

    #     return jsonify({
    #         'success': True,
    #         'msg': '',
    #         'data': {
    #             'Students': student_data,
    #             'AllMaxScore': int(all_max_score)
    #         }
    #     }), 200
    # ONE massive query to fetch everything at once

    try:
        # 1. Get lab details
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
            SELECT ST.UID, ST.CID, ST.GID, US.Name
            FROM student ST
            JOIN user US ON ST.UID = US.UID
            WHERE {cid_condition} OR {gid_condition}
        """
        cursor.execute(query)
        students = cursor.fetchall()

        # 4. OPTIMIZATION: Get all submissions for this lab in ONE query
        query = """
            SELECT UID, QID, Score, Timestamp, SID
            FROM submitted
            WHERE LID = %s
        """
        cursor.execute(query, (LID,))
        all_submissions = cursor.fetchall()
        
        # Build a lookup dictionary: {(UID, QID): (Score, Timestamp, SID)}
        submission_lookup = {}
        for sub in all_submissions:
            sub_uid, sub_qid, sub_score, sub_time, sub_sid = sub
            submission_lookup[(sub_uid, sub_qid)] = (sub_score, sub_time, sub_sid)

        # 5. Process data in memory (No more DB calls in the loop!)
        student_data = []
        current_time = datetime.now() # Call this once outside the loop for efficiency

        for student in students:
            UID, CID, GID, Name = student
            student_smt = []
            all_score = 0

            for question in questions:
                QID, MaxScore = question

                # Fetch from our memory dictionary instead of the database
                submission = submission_lookup.get((UID, QID))
                
                score = submission[0] if submission and submission[0] is not None else 0
                timestamp = submission[1] if submission else None
                SID = submission[2] if submission else -1

                if timestamp:
                    timestamp_str = timestamp.strftime("%d/%m/%Y %H:%M")
                    late = timestamp > due_date
                else:
                    timestamp_str = "-"
                    late = current_time > due_date

                student_smt.append({
                    "Time": timestamp_str,
                    "Late": late,
                    "Score": "{:.2f}".format(score),
                    "MaxScore": int(MaxScore),
                    "SID": SID
                })
                all_score += score

            student_data.append({
                "UID": UID,
                "Name": Name,
                "SMT": student_smt,
                "AllScore": "{:.2f}".format(all_score)
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