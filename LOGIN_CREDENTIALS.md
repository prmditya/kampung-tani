# Kampung Tani - Login Credentials

## Default Users for Testing ✅ CONFIRMED WORKING

### Admin User

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@kampungtani.com
- **Role:** admin
- **Status:** ✅ Login working

### Regular User

- **Username:** `user1`
- **Password:** `user123`
- **Email:** user@kampungtani.com
- **Role:** user
- **Status:** ✅ Login working

## Backend API Test Results

- ✅ Admin login: SUCCESS (returns JWT token)
- ✅ User1 login: SUCCESS (returns JWT token)
- **API Endpoint:** POST /api/auth/login
- **Expected payload:** `{"username": "string", "password": "string"}`
- **Response:** `{"access_token": "jwt_token"}`

## Password Hash Implementation

- **Library:** bcrypt (direct implementation, not passlib)
- **Hash format:** `$2b$12$...`
- **Database:** PostgreSQL with correct bcrypt hashes

## Application URLs

- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/docs
- **Database:** localhost:5433 (kampung_tani database)

## MQTT Testing

Run the SEM225 test script to send sample sensor data:

```bash
python test_mqtt_sem225.py
```

## Password Management

To generate new password hashes, use the backend container:

```bash
docker exec kampungtani_backend python generate_password.py
```

To test existing passwords:

```bash
docker exec kampungtani_backend python test_password.py
```
