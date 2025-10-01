# 🔐 Security Guidelines

Panduan keamanan untuk Kampung Tani IoT Monitoring System.

## 🚨 Langkah Keamanan Wajib

### 1. Environment Variables (.env)

File `.env` berisi informasi sensitif dan TIDAK BOLEH di-commit ke repository:

```bash
# ✅ AMAN - File ini di .gitignore
.env

# ❌ BAHAYA - Jangan commit file ini
.env.backup
.env.production
```

### 2. Password Requirements

**Wajib ganti password default sebelum production!**

```bash
# ❌ JANGAN gunakan password ini di production
POSTGRES_PASSWORD=kampungtani_secure_password_2024

# ✅ Gunakan password yang kuat
POSTGRES_PASSWORD=YourSuperSecurePassword2024!@#$
```

**Requirements password yang aman:**

- Minimal 16 karakter
- Kombinasi huruf besar, kecil, angka, dan simbol
- Tidak menggunakan kata yang mudah ditebak
- Unik untuk setiap environment (dev/staging/prod)

### 3. Secret Keys

Ganti semua secret keys sebelum deployment:

```bash
# ❌ BAHAYA - Secret key yang lemah
SECRET_KEY=your-super-secret-key-change-this

# ✅ AMAN - Generate secret key yang kuat
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
```

### 4. Database Security

```bash
# Buat user database dengan privilege terbatas
CREATE USER kampungtani_user WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE ON sensor_data TO kampungtani_user;
GRANT SELECT, INSERT, UPDATE ON sensor_config TO kampungtani_user;
GRANT SELECT ON users TO kampungtani_user;
```

### 5. MQTT Security

Untuk production, gunakan MQTT dengan authentication:

```bash
# Development (tidak aman)
MQTT_BROKER_HOST=host.docker.internal
MQTT_BROKER_PORT=1883

# Production (aman dengan SSL/TLS)
MQTT_BROKER_HOST=secure.mqtt.server.com
MQTT_BROKER_PORT=8883
MQTT_USE_SSL=true
MQTT_USERNAME=secure_username
MQTT_PASSWORD=secure_password
MQTT_CA_CERT_PATH=/path/to/ca.crt
```

## 🔒 Best Practices

### 1. Environment Separation

Gunakan file `.env` yang berbeda untuk setiap environment:

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

### 2. Backup Strategy

```bash
# Backup environment variables secara aman
cp .env .env.backup.$(date +%Y%m%d)

# Simpan backup di location yang aman (tidak di repository)
```

### 3. Container Security

```dockerfile
# Jangan jalankan container sebagai root
USER node

# Gunakan multi-stage build
FROM node:20-alpine AS builder
# ... build steps
FROM node:20-alpine AS runtime
COPY --from=builder /app ./
```

### 4. Network Security

```yaml
# docker-compose.yml - Gunakan internal networks
networks:
  internal:
    driver: bridge
    internal: true

services:
  db:
    networks:
      - internal
    # Jangan expose database ke public
```

### 5. Logging Security

```bash
# Jangan log informasi sensitif
# ❌ BAHAYA
print(f"Database password: {DB_PASS}")

# ✅ AMAN
logging.info("Database connection established")
```

## 🚫 Yang TIDAK Boleh Dilakukan

### 1. Commit Secrets ke Repository

```bash
# ❌ JANGAN commit file-file ini:
.env
.env.local
.env.production
secrets/
passwords.txt
database.sql (jika berisi data sensitif)
```

### 2. Hardcode Credentials

```python
# ❌ BAHAYA - Hardcode password
db_password = "kampungtani123"

# ✅ AMAN - Gunakan environment variables
db_password = os.environ.get('DB_PASS')
```

### 3. Use Default Passwords

```bash
# ❌ BAHAYA - Password default
POSTGRES_PASSWORD=postgres
POSTGRES_PASSWORD=admin
POSTGRES_PASSWORD=123456

# ✅ AMAN - Password yang kuat dan unik
POSTGRES_PASSWORD=Xt9#mK2$vL8@nQ4&wE7!pR5
```

### 4. Expose Sensitive Ports

```yaml
# ❌ BAHAYA - Expose database ke public
ports:
  - "5432:5432"  # Accessible from anywhere

# ✅ AMAN - Hanya expose ke localhost atau gunakan port mapping
ports:
  - "127.0.0.1:5433:5432"  # Only localhost access
```

## 🛡️ Security Checklist

Sebelum deployment ke production, pastikan:

- [ ] Semua password default sudah diganti
- [ ] File `.env` tidak di-commit ke repository
- [ ] Secret keys menggunakan entropy tinggi
- [ ] Database user memiliki privilege minimal yang dibutuhkan
- [ ] MQTT menggunakan SSL/TLS dan authentication
- [ ] Container tidak berjalan sebagai root user
- [ ] Sensitive ports tidak exposed ke public
- [ ] Logging tidak mencatat informasi sensitif
- [ ] Backup `.env` disimpan dengan aman
- [ ] Monitoring dan alerting untuk security events

## 🚨 Incident Response

Jika terjadi security breach:

1. **Immediate Actions**

   - Hentikan semua services: `docker-compose down`
   - Ganti semua passwords dan secret keys
   - Review logs untuk aktivitas mencurigakan

2. **Investigation**

   - Periksa `docker-compose logs` untuk anomali
   - Check database logs untuk akses tidak authorized
   - Review MQTT logs untuk koneksi suspicious

3. **Recovery**
   - Deploy dengan credentials baru
   - Update monitoring dan alerting
   - Dokumentasikan incident dan lessons learned

## 📞 Security Contact

Untuk melaporkan vulnerabilities:

- Email: security@kampungtani.com
- Severity: Critical/High/Medium/Low
- Please provide detailed steps to reproduce

---

**Security is everyone's responsibility! 🔐**
