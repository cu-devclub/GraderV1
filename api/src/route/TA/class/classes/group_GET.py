from function.db import get_db
from flask import jsonify, request

def main():
    conn = get_db()
    cursor = conn.cursor()
    
    CSYID = request.args.get("CSYID")

    pre_query = """SELECT useGroup FROM class WHERE CSYID = %s"""
    cursor.execute(pre_query, (CSYID,))
    data = cursor.fetchone()
    if not bool(data[0]):
        return jsonify([])


    include_count = request.args.get("include_count") == "true"

    if include_count:
        section_query = """
            SELECT GRP.Group, COUNT(ST.ID)
            FROM `group` GRP
            LEFT JOIN student ST ON GRP.GID = ST.GID
            WHERE GRP.CSYID = %s
            GROUP BY GRP.GID
        """
        cursor.execute(section_query, (CSYID,))
        data = cursor.fetchall()
        transformdata = sorted([{"name": row[0], "count": row[1]} for row in data], key=lambda x: x["name"])
        return jsonify(transformdata)
    else:
        section_query = """SELECT GRP.Group FROM `group` GRP WHERE GRP.CSYID = %s"""
        cursor.execute(section_query, (CSYID,))
        data = cursor.fetchall()
        transformdata = sorted([row[0] for row in data])
        return jsonify(transformdata)