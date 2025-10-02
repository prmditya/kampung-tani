#!/usr/bin/env python3
"""
Script untuk generate password hash sederhana
"""

import hashlib
import bcrypt

def generate_bcrypt_hash(password: str) -> str:
    """Generate bcrypt hash for password"""
    # Truncate password jika terlalu panjang
    if len(password) > 72:
        password = password[:72]
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Generate hash untuk password yang kita inginkan
passwords = {
    "admin": "admin123",
    "user1": "user123"
}

print("Generated password hashes using bcrypt:")
print()
for username, password in passwords.items():
    try:
        hash_value = generate_bcrypt_hash(password)
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"Hash: {hash_value}")
        print()
        
        # Test verification
        is_valid = bcrypt.checkpw(password.encode('utf-8'), hash_value.encode('utf-8'))
        print(f"Verification test: {'PASS' if is_valid else 'FAIL'}")
        print("-" * 50)
    except Exception as e:
        print(f"Error generating hash for {username}: {e}")