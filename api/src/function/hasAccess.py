def hasAccess(db, cursor, Email, Role, LID):
    if str(Role) == '2':
        return True
    
    query = "SELECT Exam FROM lab WHERE LID = %s"
    cursor.execute(query, (LID,))
    result = cursor.fetchone()
    
    if not result:
        return False
        
    if int(result[0]) == 0:
        return True
        
    query_acc = "SELECT ID FROM taexamaccess WHERE LID = %s AND Email = %s"
    cursor.execute(query_acc, (LID, Email))
    if cursor.fetchone():
        return True
        
    return False
