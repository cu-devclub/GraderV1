from function.db import get_db
from flask import jsonify, request

def main():
    conn = get_db()
    cursor = conn.cursor()
    
    CSYID = request.args.get("CSYID")
    include_count = request.args.get("include_count") == "true"
    
    if include_count:
        section_query = """
            SELECT SCT.Section, COUNT(ST.ID)
            FROM section SCT
            LEFT JOIN student ST ON SCT.CID = ST.CID
            WHERE SCT.CSYID = %s
            GROUP BY SCT.CID
        """
        cursor.execute(section_query, (CSYID,))
        data = cursor.fetchall()
        transformdata = sorted([{"name": row[0], "count": row[1]} for row in data], key=lambda x: x["name"])
        return jsonify(transformdata)
    else:
        section_query = """SELECT SCT.Section FROM section SCT WHERE SCT.CSYID = %s"""
        cursor.execute(section_query, (CSYID,))
        data = cursor.fetchall()
        transformdata = sorted([row[0] for row in data])
        return jsonify(transformdata)