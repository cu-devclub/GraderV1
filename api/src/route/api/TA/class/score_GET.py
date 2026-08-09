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
        query = """
            SELECT 
                LB.Due,
                ST.UID, US.Name,
                QST.QID, QST.MaxScore,
                SUB.Score, SUB.Timestamp, SUB.SID
            FROM lab LB
            
            -- 1. Get all questions for this lab
            JOIN question QST ON QST.LID = LB.LID
            
            -- 2. Get students whose CID or GID is inside the Lab's JSON arrays
            -- (Assuming MySQL/MariaDB JSON_CONTAINS syntax)
            JOIN student ST ON 
                (LB.CID IS NOT NULL AND JSON_CONTAINS(LB.CID, CAST(ST.CID AS CHAR))) OR 
                (LB.GID IS NOT NULL AND JSON_CONTAINS(LB.GID, CAST(ST.GID AS CHAR)))
                
            -- 3. Get the student's name
            JOIN user US ON ST.UID = US.UID
            
            -- 4. Get submissions (LEFT JOIN because they might not have submitted yet)
            LEFT JOIN submitted SUB ON SUB.UID = ST.UID AND SUB.QID = QST.QID AND SUB.LID = LB.LID
            
            WHERE LB.LID = %s
            ORDER BY ST.UID, QST.QID ASC
        """
        
        cursor.execute(query, (LID,))
        rows = cursor.fetchall()

        if not rows:
            return jsonify({
                'success': False,
                'msg': 'Lab not found, or no students/questions assigned to this lab.',
                'data': {}
            }), 404

        # Parse the flat SQL result into the nested JSON structure
        students_dict = {}
        processed_questions = set()
        all_max_score = 0
        current_time = datetime.now()
        due_date = rows[0][0] # Due date is the same for all rows

        for row in rows:
            due, uid, name, qid, max_score, score, timestamp, sid = row

            # Calculate total max score (only count each question once)
            if qid not in processed_questions:
                all_max_score += int(max_score)
                processed_questions.add(qid)

            # Initialize the student in our dictionary if they aren't there yet
            if uid not in students_dict:
                students_dict[uid] = {
                    "UID": uid,
                    "Name": name,
                    "SMT": [],
                    "AllScore": 0.0
                }

            # Handle missing submissions (LEFT JOIN results in NULLs)
            actual_score = score if score is not None else 0
            actual_sid = sid if sid is not None else -1
            
            if timestamp:
                timestamp_str = timestamp.strftime("%d/%m/%Y %H:%M")
                late = timestamp > due_date
            else:
                timestamp_str = "-"
                late = current_time > due_date

            # Add the question data to the student's SMT list
            students_dict[uid]["SMT"].append({
                "Time": timestamp_str,
                "Late": late,
                "Score": "{:.2f}".format(actual_score),
                "MaxScore": int(max_score),
                "SID": actual_sid
            })
            
            students_dict[uid]["AllScore"] += actual_score

        # Format AllScore for all students and convert dictionary to list
        student_data = []
        for student in students_dict.values():
            student["AllScore"] = "{:.2f}".format(student["AllScore"])
            student_data.append(student)

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