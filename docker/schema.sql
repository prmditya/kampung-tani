-- PostgreSQL schema for Kampung Tani
-- Updated to match current database structure

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT REFERENCES devices(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sensor_measurements (
    id BIGSERIAL PRIMARY KEY,
    sensor_data_id BIGINT REFERENCES sensor_data(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL
);

CREATE TABLE sensor_calibrations (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT REFERENCES devices(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL,
    param_name VARCHAR(50) NOT NULL,
    param_value DOUBLE PRECISION,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data untuk testing
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin Kampung Tani', 'admin@kampungtani.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewH.doBXVFW0.aeW', 'admin');