import hashlib


def ruleHash(text) -> str:
    # Identifies the rule version a student acknowledged; editing the rule changes it
    return hashlib.sha256((text or "").strip().encode("utf-8")).hexdigest()


def normalizeName(name) -> str:
    # Name typed to acknowledge: case-insensitive, repeated spaces count as one
    return " ".join((name or "").split()).lower()


def isRuleAcknowledged(cur, UID, LID) -> bool:
    # True when the lab has no exam rule, or the student acknowledged its current version
    cur.execute("SELECT ExamRule FROM lab WHERE LID = %s", (LID,))
    row = cur.fetchone()
    if not row or not (row[0] or "").strip():
        return True

    cur.execute(
        "SELECT 1 FROM examruleack WHERE LID = %s AND UID = %s AND RuleHash = %s LIMIT 1",
        (LID, UID, ruleHash(row[0]))
    )
    return cur.fetchone() is not None
