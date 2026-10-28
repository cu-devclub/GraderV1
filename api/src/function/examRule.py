def normalizeRule(text) -> str:
    # Students type the rule as one line: line breaks and repeated spaces count as a single space
    return " ".join((text or "").split())


def isRuleAcknowledged(cur, UID, LID) -> bool:
    # True when the lab has no exam rule, or the student has already typed it
    cur.execute("SELECT ExamRule FROM lab WHERE LID = %s", (LID,))
    row = cur.fetchone()
    if not row or not normalizeRule(row[0]):
        return True

    cur.execute("SELECT 1 FROM examruleack WHERE LID = %s AND UID = %s LIMIT 1", (LID, UID))
    return cur.fetchone() is not None
