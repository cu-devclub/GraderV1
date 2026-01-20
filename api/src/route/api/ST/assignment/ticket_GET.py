from flask import request, jsonify
import qrcode
import base64
from io import BytesIO

from function.db import get_db
from function.GenUUID import generateUUID
from function.loadconfig import config

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    UID = str(Email).split('@')[0]
    conn = get_db()
    cursor = conn.cursor()
    public_ip = request.headers.get('X-Real-IP') or request.remote_addr
    try:
        LID = request.args.get('LID')
        CSYID = request.args.get('CSYID')
        try:
            Type = int(request.args.get('Type'))
        except Exception:
            return jsonify({
                'success': False,
                'msg': 'Please contact admin',
                'data': "Type is invalid"
            }), 500
        
        if Type < 0 or Type > 1:
            return jsonify({
                'success': False,
                'msg': 'Please contact admin',
                'data': "Type is invalid"
            }), 500

        # Type 0 = checkout

        query = """ 
            SELECT
                ID
            FROM
                ticket
            WHERE 
                UID = %s AND
                LID = %s AND
                CSYID = %s AND
                Type = %s AND
                ip = %s
        """
        cursor.execute(query, (UID, LID, CSYID, Type, public_ip))
        data = cursor.fetchone()
        
        if data is None:
            ID = generateUUID()
            cursor.execute("INSERT INTO ticket (ID, UID, CSYID, LID, Type, ip) VALUES (%s, %s, %s, %s, %s, %s);", (ID, UID, CSYID, LID, Type, public_ip))
            conn.commit()

            event_name = f"delete_event_{ID}"  # Create a unique event name

            # Prepare the SQL query with the dynamically constructed event name
            query = f"""
                CREATE EVENT {event_name}
                ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 15 MINUTE
                DO
                DELETE FROM ticket
                WHERE ID = %s;
            """

            # Execute the SQL query
            cursor.execute(query, (ID,))
            conn.commit()
        else:
            ID = data[0]
        img = qrcode.make(config.get("DOMAIN") + "DSC/" + str(ID))
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        img_bytes = buffer.getvalue()

        # Encode the bytes-like object to base64
        imgStr = "data:image/png;base64, " + base64.b64encode(img_bytes).decode('ascii')
        return jsonify({
            'success': True,
            'msg': '',
            'data': {"qr": imgStr, "ID": ID}
        }), 200
    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({
            'success': False,
            'msg': 'Please contact admin',
            'data': str(e)
        }), 500