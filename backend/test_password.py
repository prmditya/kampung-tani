#!/usr/bin/env python3
"""
Script untuk test password hash di container backend
"""

import bcrypt

def test_passwords():
    stored_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeiwH5oBXVFW0.aeW"
    test_passwords = [
        "admin123",
        "admin", 
        "password",
        "123456",
        "kampung_tani",
        "user123",
        "user",
        "test123"
    ]

    print("Testing passwords against stored hash...")
    print(f"Stored hash: {stored_hash}")
    print()

    for password in test_passwords:
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
            status = "MATCH" if is_valid else "NO MATCH"
            print(f"'{password}' -> {status}")
        except Exception as e:
            print(f"'{password}' -> Error: {e}")

if __name__ == "__main__":
    test_passwords()