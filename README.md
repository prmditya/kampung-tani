# 🌱 Kampung Tani IoT Monitoring System

Sistem monitoring IoT untuk sensor tanah menggunakan perangkat ECU-1051 Advantech dengan interface web modern.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi Stack](#teknologi-stack)
- [Setup Environment](#setup-environment)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
- [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
- [API Endpoints](#api-endpoints)
- [MQTT Configuration](#mqtt-configuration)
- [Troubleshooting](#troubleshooting)

## 🚀 Fitur Utama

- **Dashboard Modern**: UI responsif dengan dark/light mode
- **Real-time Monitoring**: Auto-refresh data sensor setiap 10 detik
- **Data Table**: Tabel data lengkap dengan sorting dan pagination
- **MQTT Integration**: Listener untuk data dari ECU-1051 Advantech
- **REST API**: Endpoints untuk mengakses data sensor
- **Database**: PostgreSQL dengan schema yang robust
- **Docker**: Containerized deployment dengan hot reload

## 🛠 Teknologi Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn UI, React Icons
- **Backend**: Flask, Python, PostgreSQL
- **MQTT**: Mosquitto broker, Paho MQTT client
- **Development**: VS Code Dev Containers, Docker Compose

## 🚀 Quick Start dengan Dev Containers (Recommended)

**Untuk pengalaman development terbaik tanpa issues TypeScript/linting:**

1. **Prerequisites:**

   - Install [VS Code](https://code.visualstudio.com/)
   - Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Buka Project:**

   ```bash
   git clone <repository-url>
   cd kampung-tani
   code .
   ```

3. **Launch Dev Container:**

   - VS Code akan menampilkan prompt "Reopen in Container" - klik **Yes**
   - Atau gunakan `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"
   - Container akan otomatis build dan install semua dependencies

4. **Ready to Code! 🎉**
   - Semua TypeScript dependencies tersedia
   - Linting dan IntelliSense berfungsi sempurna
   - Hot reloading aktif untuk development
   - Debugging terintegrasi untuk frontend & backend

**Benefits Dev Container:**

- ✅ No more "Cannot find module 'react-icons'" errors
- ✅ Perfect TypeScript linting dan autocomplete
- ✅ Consistent environment untuk semua developer
- ✅ No need install Node.js, Python di host system
- **Deployment**: Docker Compose
- **Database**: PostgreSQL 15

## 🔧 Setup Environment

### 1. Clone Repository

```bash
git clone <repository-url>
cd kampung-tani
```

### 2. Setup Environment Variables

Copy file `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit file `.env` sesuai kebutuhan Anda:

```bash
nano .env
```

### 3. Pastikan Docker Tersedia

```bash
docker --version
docker-compose --version
```

## 🏃‍♂️ Instalasi & Menjalankan

### Development Mode

```bash
# Build dan jalankan semua services
docker-compose up --build

# Atau jalankan di background
docker-compose up -d --build
```

### Akses Aplikasi

- **Frontend**: http://localhost:3002 (atau sesuai FRONTEND_EXTERNAL_PORT)
- **Backend API**: http://localhost:5000 (atau sesuai BACKEND_EXTERNAL_PORT)
- **Database**: localhost:5433 (atau sesuai DB_EXTERNAL_PORT)

### Menghentikan Services

```bash
# Hentikan containers
docker-compose down

# Hentikan dan hapus volumes (reset database)
docker-compose down -v
```

## 🔐 Konfigurasi Environment Variables

File `.env` berisi konfigurasi sensitif yang tidak boleh di-commit ke repository. Berikut penjelasan setiap variabel:

### Database Configuration

```bash
POSTGRES_DB=kampungtani_db          # Nama database
POSTGRES_USER=kampungtani_user      # Username database
POSTGRES_PASSWORD=your_password     # Password database (GANTI!)
POSTGRES_HOST=db                    # Host database (container name)
POSTGRES_PORT=5432                  # Port internal database
```

### Port Configuration

```bash
DB_EXTERNAL_PORT=5433              # Port eksternal untuk akses database
BACKEND_EXTERNAL_PORT=5000         # Port eksternal untuk API
FRONTEND_EXTERNAL_PORT=3002        # Port eksternal untuk web app
```

### MQTT Configuration

```bash
MQTT_BROKER_HOST=host.docker.internal  # Host MQTT broker
MQTT_BROKER_PORT=1883                  # Port MQTT broker
MQTT_TOPIC_SENSOR=sensor/ecu1051/data  # Topic MQTT untuk data sensor
MQTT_CLIENT_ID=kampungtani_listener    # Client ID untuk MQTT
```

### Security Configuration

```bash
SECRET_KEY=your-secret-key-here        # Secret key untuk Flask (GANTI!)
JWT_SECRET_KEY=jwt-secret-here         # JWT secret key (GANTI!)
```

### 🔒 PENTING - Security Best Practices

1. **Jangan pernah commit file `.env`** - file ini sudah ada di `.gitignore`
2. **Ganti semua password default** sebelum production
3. **Gunakan password yang kuat** minimal 16 karakter
4. **Backup file `.env`** di tempat yang aman
5. **Gunakan environment variables berbeda** untuk production

## 📡 API Endpoints

### Sensor Data

```bash
GET /api/sensor-data                   # Ambil semua data sensor
GET /api/sensor-config                 # Ambil konfigurasi sensor
POST /api/sensor-config               # Update konfigurasi sensor
```

### Contoh Response

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "moisture": 45.5,
      "temperature": 28.2,
      "ph": 6.8,
      "conductivity": 1250.0,
      "created_at": "2024-03-15T10:30:00Z"
    }
  ],
  "status": "success"
}
```

## 📨 MQTT Configuration

### Format Data yang Diterima

```json
{
  "deviceName": "ECU-1051-01",
  "tags": [
    { "name": "SEM225:Moisture", "value": 45.5 },
    { "name": "SEM225:Temperature", "value": 28.2 },
    { "name": "SEM225:PH", "value": 6.8 },
    { "name": "SEM225:Conductivity", "value": 1250.0 }
  ]
}
```

### Setup MQTT Broker

Jika menggunakan Mosquitto lokal:

```bash
# Install Mosquitto
sudo apt-get install mosquitto mosquitto-clients

# Jalankan broker
mosquitto -d

# Test publish data
mosquitto_pub -h localhost -t sensor/ecu1051/data -m '{"deviceName":"ECU-1051-01","tags":[{"name":"SEM225:Moisture","value":45.5}]}'
```

## 🐛 Troubleshooting

### Container Tidak Bisa Start

1. **Check port conflicts**:

   ```bash
   netstat -tlnp | grep :3002
   ```

2. **Check Docker logs**:

   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   docker-compose logs db
   ```

3. **Rebuild containers**:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

### Database Connection Error

1. **Check environment variables di .env**
2. **Pastikan database sudah ready**:

   ```bash
   docker-compose logs db
   ```

3. **Reset database**:
   ```bash
   docker-compose down -v
   docker-compose up db
   ```

### Frontend Not Loading

1. **Check Node.js dependencies**:

   ```bash
   docker-compose exec frontend npm install
   ```

2. **Clear Next.js cache**:
   ```bash
   docker-compose exec frontend rm -rf .next
   docker-compose restart frontend
   ```

### MQTT Connection Issues

1. **Check MQTT broker status**
2. **Verify MQTT_BROKER_HOST di .env**
3. **Test MQTT connection**:
   ```bash
   mosquitto_sub -h localhost -t sensor/ecu1051/data
   ```

## 🤝 Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan MIT License.

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository ini.

---

**Made with ❤️ for Smart Agriculture**
