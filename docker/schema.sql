-- PostgreSQL schema for Kampung Tani FastAPI
-- Fresh schema with clean structure

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    device_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT REFERENCES devices(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX idx_sensor_data_type ON sensor_data(sensor_type);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@kampungtani.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeiwH5oBXVFW0.aeW', 'admin'),
('user1', 'user@kampungtani.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeiwH5oBXVFW0.aeW', 'user');

-- Insert sample devices
INSERT INTO devices (user_id, name, description, location, device_type, status) VALUES 
(1, 'Sensor Greenhouse A1', 'Temperature and humidity sensor for greenhouse A1', 'Greenhouse A1', 'climate_sensor', 'online'),
(1, 'Soil Monitor B2', 'Soil moisture and pH sensor for field B2', 'Field B2', 'soil_sensor', 'offline'),
(2, 'Weather Station C1', 'Complete weather monitoring station', 'Field C1', 'weather_station', 'online');

-- Insert sample sensor data
INSERT INTO sensor_data (device_id, sensor_type, value, unit, metadata) VALUES 
(1, 'temperature', 25.5, '°C', '{"location": "greenhouse_a1"}'),
(1, 'humidity', 65.2, '%', '{"location": "greenhouse_a1"}'),
(2, 'soil_moisture', 45.0, '%', '{"depth": "10cm"}'),
(2, 'ph', 6.8, 'pH', '{"depth": "10cm"}'),
(3, 'temperature', 22.1, '°C', '{"outdoor": true}'),
(3, 'wind_speed', 5.2, 'm/s', '{"direction": "NE"}');