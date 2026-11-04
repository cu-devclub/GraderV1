def isOtherIPCheckedOut(cur, UID, LID, ip) -> bool:
    # Exam access is bound to one IP per UID per lab; rows with empty ip never grant access
    cur.execute("""
        SELECT 1
        FROM checkout
        WHERE UID = %s AND LID = %s AND ip <> '' AND ip IS NOT NULL AND ip <> %s
            AND CheckoutTime IS NULL
        LIMIT 1
    """, (UID, LID, ip or ''))
    return cur.fetchone() is not None
