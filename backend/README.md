# Kampung Tani IoT Backend API

Modern RESTful API untuk Kampung Tani IoT monitoring system dengan dokumentasi Swagger yang komprehensif.

## 📋 Daftar Isi

- [Arsitektur](#arsitektur)
- [Struktur Project](#struktur-project)
- [API Endpoints](#api-endpoints)
- [Instalasi & Setup](#instalasi--setup)
- [Database Schema](#database-schema)
- [MQTT Listener](#mqtt-listener)
- [Testing](#testing)
- [Docker Configuration](#docker-configuration)

---

## 🏗️ Arsitektur

Backend menggunakan **modular architecture** dengan Flask-RESTX untuk API RESTful dan dokumentasi Swagger otomatis.

### Tech Stack

- **Framework**: Flask + Flask-RESTX
- **Database**: PostgreSQL
- **MQTT**: Paho MQTT Client
- **Process Manager**: Supervisor
- **Containerization**: Docker
- **Documentation**: Swagger/OpenAPI

### Komponen Utama

1. **RESTful API** - Endpoints modern dengan HTTP methods yang tepat
2. **MQTT Listener** - Real-time sensor data ingestion
3. **Database Layer** - PostgreSQL dengan connection pooling
4. **Legacy Compatibility** - Backward compatibility untuk sistem lama

---

## 📁 Struktur Project

```
backend/
├── api.py                 # Main Flask application
├── mqtt_listener.py       # MQTT client untuk sensor data
├── supervisord.conf       # Process manager config
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
│
├── app/                  # Modular application package
│   ├── config.py         # Configuration management
│   ├── models/
│   │   └── swagger_models.py  # Swagger documentation models
│   ├── resources/        # RESTful endpoints
│   │   ├── sensors.py    # Sensor data endpoints
│   │   ├── devices.py    # Device management endpoints
│   │   └── legacy.py     # Legacy compatibility routes
│   └── utils/           # Utility modules
│       ├── database.py   # Database connection & helpers
│       └── helpers.py    # Common helper functions
│
├── tests/               # Unit tests
│   ├── conftest.py      # Test configuration
│   └── test_devices.py  # Device endpoint tests
│
└── logs/               # Application logs (generated)
    ├── flask_api.log
    ├── mqtt_listener.log
    └── supervisord.log
```

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:5000
```

### Swagger Documentation

```
http://localhost:5000/
```

### 1. Sensor Data Endpoints

#### GET `/api/sensors/`

Mendapatkan semua data sensor dengan pagination.

**Query Parameters:**

- `page` (integer, default: 1) - Nomor halaman
- `limit` (integer, default: 50, max: 100) - Items per halaman

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "device_id": 1,
      "device_name": "ECU-1051-Address-1",
      "user_name": "Admin Kampung Tani",
      "created_at": "2025-09-30T15:56:20+07:00",
      "moisture": 0.0,
      "temperature": 26.8,
      "conductivity": 0.0,
      "ph": 9.0,
      "nitrogen": 0.0,
      "phosphorus": 0.0,
      "potassium": 0.0,
      "salinity": 0.0,
      "tds": 0.0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 156,
    "pages": 4
  },
  "status": "success"
}
```

### 2. Device Management Endpoints

#### GET `/api/devices/`

Mendapatkan semua device dengan pagination.

**Query Parameters:**

- `page` (integer, default: 1) - Nomor halaman
- `limit` (integer, default: 50, max: 100) - Items per halaman

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "ECU-1051-Address-1",
      "address": 1,
      "baud_rate": 4800,
      "type": "sensor",
      "status": "online",
      "last_seen": "2025-09-30T15:56:40+07:00",
      "uptime_seconds": 326.47,
      "user_name": "Admin Kampung Tani",
      "created_at": "2025-09-30T08:00:00+07:00",
      "updated_at": "2025-09-30T15:56:40+07:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  },
  "status": "success"
}
```

#### GET `/api/devices/stats`

Mendapatkan statistik device secara keseluruhan.

**Response:**

```json
{
  "data": {
    "total_devices": 1,
    "status_counts": {
      "online": 1,
      "offline": 0,
      "restarted": 0
    },
    "recent_data_count": 156
  },
  "status": "success"
}
```

#### GET `/api/devices/{device_id}`

Mendapatkan detail device berdasarkan ID.

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "ECU-1051-Address-1",
    "address": 1,
    "baud_rate": 4800,
    "type": "sensor",
    "status": "online",
    "last_seen": "2025-09-30T15:56:40+07:00",
    "uptime_seconds": 326.47,
    "user_name": "Admin Kampung Tani",
    "created_at": "2025-09-30T08:00:00+07:00",
    "updated_at": "2025-09-30T15:56:40+07:00"
  },
  "status": "success"
}
```

#### GET `/api/devices/{device_id}/status-history`

Mendapatkan riwayat status device.

**Response:**

```json
{
  "data": [
    {
      "status": "online",
      "uptime_seconds": 326.47,
      "created_at": "2025-09-30T15:56:40+07:00"
    }
  ],
  "status": "success"
}
```

### 3. Sensor Calibrations

#### GET `/api/sensor-calibrations`

Mendapatkan data kalibrasi sensor.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "device_id": 1,
      "sensor_type": "temperature_cal",
      "param_name": "temperature_cal",
      "param_value": 0.0,
      "updated_at": "2025-09-30T15:56:20+07:00"
    }
  ],
  "status": "success"
}
```

### 4. Legacy Endpoints (Backward Compatibility)

#### GET `/sensor-data`

Legacy endpoint untuk kompatibilitas sistem lama.

#### GET `/device-list`

Legacy endpoint untuk daftar device.

---

## 🚀 Instalasi & Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 12+
- Docker & Docker Compose
- MQTT Broker (opsional untuk testing)

### Local Development

1. **Clone repository**

```bash
git clone <repository-url>
cd kampung-tani/backend
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Set environment variables**

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=kampungtani
export DB_USER=kampungtani
export DB_PASS=kampungtani
export MQTT_HOST=localhost
export MQTT_PORT=1883
export MQTT_TOPIC=sensor/ecu1051/data
```

4. **Run application**

```bash
python api.py
```

### Docker Setup (Recommended)

1. **Build dan run dengan Docker Compose**

```bash
docker-compose up -d
```

2. **View logs**

```bash
docker-compose logs backend
```

3. **Restart services**

```bash
docker-compose restart backend
```

---

## 🗄️ Database Schema

### Tables

#### `users`

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `devices`

```sql
CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    address INTEGER,
    baud_rate INTEGER,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP,
    uptime_seconds DOUBLE PRECISION
);
```

#### `sensor_data`

```sql
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT REFERENCES devices(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `sensor_measurements`

```sql
CREATE TABLE sensor_measurements (
    id BIGSERIAL PRIMARY KEY,
    sensor_data_id BIGINT REFERENCES sensor_data(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL
);
```

#### `sensor_calibrations`

```sql
CREATE TABLE sensor_calibrations (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT REFERENCES devices(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL,
    param_name VARCHAR(50) NOT NULL,
    param_value DOUBLE PRECISION,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 MQTT Listener

### Konfigurasi

- **Topic**: `sensor/ecu1051/data`
- **Format**: JSON payload dari sensor IoT
- **Process**: Otomatis parsing dan simpan ke database

### Payload Format

```json
{
  "d": [
    { "tag": "SEM225:Moisture", "value": 0.0 },
    { "tag": "SEM225:Temperature", "value": 268.0 },
    { "tag": "SEM225:Conductivity", "value": 0.0 },
    { "tag": "SEM225:PH", "value": 90.0 },
    { "tag": "SEM225:Nitrogen", "value": 0.0 },
    { "tag": "SEM225:Phosphorus", "value": 0.0 },
    { "tag": "SEM225:Potassium", "value": 0.0 },
    { "tag": "SEM225:Salinity", "value": 0.0 },
    { "tag": "SEM225:TDS", "value": 0.0 },
    { "tag": "SEM225:Device_Address", "value": 1.0 },
    { "tag": "SEM225:Device_Baud_Rate", "value": 1.0 },
    { "tag": "#SYS_UPTIME", "value": 306.65 }
  ],
  "ts": "2025-09-30T08:56:20Z"
}
```

### Data Processing

1. **Parse payload** - Extract sensor values dan device info
2. **Device management** - Create/update device records
3. **Data storage** - Simpan measurements ke database
4. **Calibration data** - Store calibration parameters
5. **Status tracking** - Update device online status dan uptime

---

## 🧪 Testing

### Run Unit Tests

```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

### API Testing dengan cURL

**Get sensor data:**

```bash
curl -X GET "http://localhost:5000/api/sensors/?page=1&limit=10"
```

**Get device stats:**

```bash
curl -X GET "http://localhost:5000/api/devices/stats"
```

**Get specific device:**

```bash
curl -X GET "http://localhost:5000/api/devices/1"
```

---

## 🐳 Docker Configuration

### Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && pip install supervisor
COPY . .
EXPOSE 5000
CMD ["supervisord", "-c", "/app/supervisord.conf"]
```

### Services

- **Flask API** - Port 5000, RESTful endpoints
- **MQTT Listener** - Background service untuk sensor data
- **Supervisor** - Process manager untuk kedua services

### Environment Variables

```yaml
environment:
  - DB_HOST=db
  - DB_PORT=5432
  - DB_NAME=kampungtani
  - DB_USER=kampungtani
  - DB_PASS=kampungtani
  - MQTT_HOST=host.docker.internal
  - MQTT_PORT=1883
  - MQTT_TOPIC=sensor/ecu1051/data
```

---

## 📊 Monitoring & Logs

### Log Files

- `flask_api.log` - API requests dan responses
- `mqtt_listener.log` - MQTT data processing
- `supervisord.log` - Process management
- `*_error.log` - Error logs untuk debugging

### Health Check

```bash
# Check API health
curl http://localhost:5000/api/devices/stats

# Check container logs
docker-compose logs backend --tail 50

# Check supervisor status
docker-compose exec backend supervisorctl status
```

---

## 🔧 Configuration

### Environment Settings

Konfigurasi dapat diatur melalui environment variables atau `app/config.py`:

- `FLASK_ENV` - Development/Production mode
- `DB_*` - Database connection settings
- `MQTT_*` - MQTT broker configuration
- `OFFLINE_THRESHOLD_MINUTES` - Device offline threshold (default: 5)

### Production Deployment

1. Set `FLASK_ENV=production`
2. Configure proper database credentials
3. Set up reverse proxy (nginx)
4. Enable SSL/TLS
5. Configure proper logging levels

---

## 📝 API Versioning

Current version: **v2.0**

- **v2.x** - Modern RESTful API dengan Swagger documentation
- **v1.x** - Legacy endpoints (backward compatibility)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Add unit tests untuk new features
4. Update documentation
5. Submit pull request

---

## 📞 Support

Untuk pertanyaan atau issue, silakan buat GitHub issue atau hubungi tim development.

---

**Last Updated:** September 30, 2025  
**API Version:** 2.0  
**Python Version:** 3.11+
