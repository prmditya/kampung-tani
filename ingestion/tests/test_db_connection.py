from app.core.database import test_connection

if test_connection():
    print("Connection success")
else:
    print("Connection failed")
