#!/usr/bin/env python3
"""
Script untuk generate password hash menggunakan passlib yang sama dengan aplikasi
"""

from passlib.context import CryptContext

# Menggunakan konfigurasi yang sama dengan security.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_password_hash(password: str) -> str:
    """Generate password hash using passlib bcrypt"""
    return pwd_context.hash(password)

# Generate hash untuk password yang kita inginkan
passwords = {
    "admin": "admin123",
    "user1": "user123"
}

print("Generated password hashes using passlib:")
print()
for username, password in passwords.items():
    hash_value = generate_password_hash(password)
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Hash: {hash_value}")
    print()

# Test verification
print("Testing verification:")
for username, password in passwords.items():
    hash_value = generate_password_hash(password)
    is_valid = pwd_context.verify(password, hash_value)
    print(f"{username}: {password} -> {'VALID' if is_valid else 'INVALID'}")