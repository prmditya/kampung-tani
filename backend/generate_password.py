#!/usr/bin/env python3
"""
Script untuk generate password hash baru
"""

import bcrypt

def generate_password_hash(password: str) -> str:
    """Generate bcrypt hash for password"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Generate hash untuk password yang kita inginkan
passwords_to_generate = {
    "admin123": "admin",
    "user123": "user1"
}

print("Generated password hashes:")
print()

for password, username in passwords_to_generate.items():
    hash_value = generate_password_hash(password)
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Hash: {hash_value}")
    print()

# Test hash yang baru dibuat
print("Testing generated hashes:")
for password, username in passwords_to_generate.items():
    hash_value = generate_password_hash(password)
    is_valid = bcrypt.checkpw(password.encode('utf-8'), hash_value.encode('utf-8'))
    print(f"{username} / {password} -> {'VALID' if is_valid else 'INVALID'}")