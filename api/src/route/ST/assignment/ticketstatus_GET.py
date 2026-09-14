from flask import request, jsonify
from function.db import get_db
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    UID = str(Email).split('@')[0]
    conn = get_db()
    cursor = conn.cursor()
    try:
        ID = request.args.get('ID')
        if not ID:
            return jsonify({
                'success': False,
                'msg': 'Missing ID',
                'data': {}
            }), 400

        query = """ 
            SELECT
                ID
            FROM
                ticket
            WHERE 
                ID = %s AND
                UID = %s
        """
        cursor.execute(query, (ID, UID))
        data = cursor.fetchone()
        
        # If the ticket is not found in the database, it means it has been processed (or expired)
        return jsonify({
            'success': True,
            'msg': '',
            'data': {
                'confirmed': data is None
            }
        }), 200
    except Exception as e:
        print(e)
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': str(e)
        }), 500
