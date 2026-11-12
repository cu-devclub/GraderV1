from flask import request, jsonify, g

from function.isCET import isCET

from flask_jwt_extended import jwt_required, get_jwt_identity

# Saves the exam rule of an existing lab right away, without saving the whole assignment
@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    conn = g.db
    cursor = conn.cursor()
    try:
        form = request.get_json()
        LID = form.get('LID')
        rule = (form.get('ExamRule') or "").strip()

        cursor.execute("SELECT CSYID FROM lab WHERE LID = %s", (LID,))
        data = cursor.fetchone()
        if data is None:
            return jsonify({'success': False, 'msg': "Lab not found", 'data': {}}), 200

        # any editor of the class; exam TA access (taexamaccess) only covers files
        if not isCET(conn, cursor, Email, data[0]):
            return jsonify({'success': False, 'msg': "You don't have permission.", 'data': {}}), 200

        cursor.execute("UPDATE lab SET ExamRule = %s WHERE LID = %s", (rule or None, LID))
        conn.commit()
        return jsonify({'success': True, 'msg': "Exam rules saved.", 'data': {}}), 200
    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({'success': False, 'msg': "Please contact admin", 'data': str(e)}), 500
