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

    UID = str(UID).strip()
    LID = str(LID).strip()

    try:
        # Parse due_date
        due_dt = None
        if isinstance(due_date, str) and due_date.strip():
            for fmt in ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M"):
                try:
                    due_dt = datetime.strptime(due_date, fmt)
                    break
                except ValueError:
                    pass
        elif hasattr(due_date, 'strftime'):
            due_dt = due_date

        # Fetch questions with matched submissions via SQL join
        query = """
            SELECT 
                QST.QID,
                QST.MaxScore,
                SMT.Score,
                SMT.Timestamp,
                COALESCE(SMT.SID, -1) AS SID
            FROM question QST
            LEFT JOIN submitted SMT ON QST.QID = SMT.QID AND SMT.UID = %s
            WHERE QST.LID = %s
            ORDER BY QST.QID ASC
        """
        cursor.execute(query, (UID, LID))
        rows = cursor.fetchall()

        if not rows:
            return jsonify({
                'success': False,
                'msg': 'No questions found for the lab',
                'data': {}
            }), 404

        student_smt = []
        all_score = 0.0

        for row in rows:
            QID, MaxScore, score, timestamp, SID = row

            score_val = float(score) if score is not None else 0.0
            sid_val = int(SID) if SID is not None else -1

            if timestamp:
                ts_dt = None
                if isinstance(timestamp, str) and timestamp.strip() and timestamp != "-":
                    for fmt in ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M"):
                        try:
                            ts_dt = datetime.strptime(timestamp, fmt)
                            break
                        except ValueError:
                            pass
                    timestamp_str = ts_dt.strftime("%d/%m/%Y %H:%M") if ts_dt else str(timestamp)
                elif hasattr(timestamp, 'strftime'):
                    ts_dt = timestamp
                    timestamp_str = timestamp.strftime("%d/%m/%Y %H:%M")
                else:
                    timestamp_str = str(timestamp) if timestamp else "-"

                if ts_dt and due_dt:
                    late = ts_dt > due_dt
                else:
                    late = False
            else:
                timestamp_str = "-"
                if due_dt:
                    late = datetime.now() > due_dt
                else:
                    late = False

            student_smt.append({
                "Time": timestamp_str,
                "Late": late,
                "Score": "{:.2f}".format(score_val),
                "MaxScore": int(MaxScore),
                "SID": sid_val
            })
            all_score += score_val

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
