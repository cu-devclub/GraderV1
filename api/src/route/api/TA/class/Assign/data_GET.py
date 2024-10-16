from function.db import get_db
from flask import request, jsonify
import os

from function.isLock import isLock
from function.isCET import isCET

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = get_db()
    cursor = conn.cursor()
    
    LID = request.args.get("LID")

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
        # Retrieve lab details
        query = """ 
            SELECT
                LB.Lab,
                LB.Name,
                LB.Publish,
                LB.Due,
                LB.CID,
                LB.GID,
                LB.CSYID,
                CASE
                    WHEN LB.Due = LB.Lock THEN 1
                    ELSE 0
                END AS LOD,
                LB.showScoreOnLock,
                LB.Exam
            FROM
                lab LB
            WHERE 
                LB.LID = %s
            """
        cursor.execute(query, (LID,))
        data = cursor.fetchone()

        isGroup = data[4] is None
        newD5 = data[5] if isGroup else data[4]
        CSYID = data[6]

        if isGroup:
            query = """
            SELECT 
                GRP.GID,
                GRP.Group 
            FROM 
                `group` GRP 
            WHERE 
                GRP.CSYID = %s"""
        else:
            query = """
            SELECT 
                SCT.CID,
                SCT.Section 
            FROM 
                section SCT 
            WHERE 
                SCT.CSYID = %s
            """

        cursor.execute(query, (CSYID,))
        data2 = cursor.fetchall()

        PreSelectList = {}
        for i in data2:
            PreSelectList[i[0]] = i[1]

        # Retrieve question details
        query = """
            SELECT
                QST.QID,
                QST.MaxScore
            FROM 
                question QST 
            WHERE 
                QST.LID = %s
            ORDER BY 
                QST.QID ASC;
            """
        
        cursor.execute(query, (LID,))
        questions = cursor.fetchall()
        
        # Retrieve addfile details
        query = """
            SELECT
                AF.ID,
                AF.Path
            FROM
                addfile AF
            WHERE
                AF.LID = %s
            """
        cursor.execute(query, (LID,))
        addfiles = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'msg': '',
            'data': {
                'LabNum': data[0],
                'LabName': data[1],
                "PubDate": data[2].strftime("%Y-%m-%dT%H:%M:%S"),
                "DueDate": data[3].strftime("%Y-%m-%dT%H:%M:%S"),
                "LOD": bool(data[7]),
                "Lock": isLock(conn, cursor, LID),
                "ShowOnLock": bool(int(data[8])),
                "isExam": bool(int(data[9])),
                "IsGroup": isGroup,
                "Selected": [PreSelectList[int(i)] for i in [i for i in newD5.strip("[] ").split(",")]],
                "SelectList": list(PreSelectList.values()),
                "Question": [{"id": i+1, "QID": questions[i][0], "score": int(questions[i][1])} for i in range(len(questions))],
                "addfile": [[file[0], os.path.basename(file[1])] for file in addfiles]
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

