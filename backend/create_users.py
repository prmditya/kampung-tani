#!/usr/bin/env python3
"""
Script untuk membuat user default untuk testing
"""
import asyncio
import asyncpg
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'kampung_tani_user'),
    'password': os.getenv('DB_PASSWORD', 'kampung_tani_2024'),
    'database': os.getenv('DB_NAME', 'kampung_tani')
}

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def create_default_users():
    """Create default users for testing"""
    try:
        # Connect to database
        conn = await asyncpg.connect(**DB_CONFIG)
        
        # Default users
        users = [
            {
                'username': 'admin',
                'email': 'admin@kampungtani.com',
                'password': 'admin123',
                'role': 'admin'
            },
            {
                'username': 'user',
                'email': 'user@kampungtani.com', 
                'password': 'user123',
                'role': 'user'
            },
            {
                'username': 'demo',
                'email': 'demo@kampungtani.com',
                'password': 'demo123',
                'role': 'user'
            }
        ]
        
        for user in users:
            # Check if user already exists
            existing = await conn.fetchrow(
                "SELECT id FROM users WHERE username = $1 OR email = $2",
                user['username'], user['email']
            )
            
            if existing:
                print(f"User {user['username']} already exists, skipping...")
                continue
            
            # Hash password
            hashed_password = hash_password(user['password'])
            
            # Insert user
            user_id = await conn.fetchval(
                """
                INSERT INTO users (username, email, hashed_password, role, created_at, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
                """,
                user['username'],
                user['email'], 
                hashed_password,
                user['role'],
                datetime.utcnow(),
                True
            )
            
            print(f"✅ Created user: {user['username']} (ID: {user_id})")
        
        await conn.close()
        print("\n🎉 Default users created successfully!")
        print("\nTest credentials:")
        print("Admin: admin / admin123")
        print("User: user / user123") 
        print("Demo: demo / demo123")
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")

if __name__ == "__main__":
    asyncio.run(create_default_users())