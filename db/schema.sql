-- ===========================================
-- DATABASE SCHEMA: KAMPOENG TANI
-- ===========================================

-- USERS TABLE
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FARMERS TABLE
CREATE TABLE farmers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FARMS TABLE
CREATE TABLE farms (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmers(id),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area_size DOUBLE PRECISION,
    soil_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GATEWAYS TABLE
CREATE TABLE gateways (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    gateway_uid VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    mac_address VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- SENSORS TABLE
CREATE TABLE sensors (
    id BIGSERIAL PRIMARY KEY,
    gateway_id BIGINT NOT NULL REFERENCES gateways(id),
    sensor_uid VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    unit VARCHAR(20),
    status VARCHAR(20) DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- GATEWAY ASSIGNMENTS TABLE
CREATE TABLE gateway_assignments (
    id BIGSERIAL PRIMARY KEY,
    gateway_id BIGINT NOT NULL REFERENCES gateways(id),
    farm_id BIGINT NOT NULL REFERENCES farms(id),
    assigned_by BIGINT REFERENCES users(id),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- SENSOR DATA TABLE
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    sensor_id BIGINT NOT NULL REFERENCES sensors(id),
    gateway_id BIGINT NOT NULL REFERENCES gateways(id),
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GATEWAY STATUS HISTORY TABLE
CREATE TABLE gateway_status_history (
    id BIGSERIAL PRIMARY KEY,
    gateway_id BIGINT NOT NULL REFERENCES gateways(id),
    status VARCHAR(20) NOT NULL,
    uptime_seconds BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_gateways_user_id ON gateways(user_id);
CREATE INDEX idx_gateways_status ON gateways(status);
CREATE INDEX idx_sensors_gateway_id ON sensors(gateway_id);
CREATE INDEX idx_sensor_data_sensor_id_timestamp ON sensor_data(sensor_id, timestamp DESC);
CREATE INDEX idx_sensor_data_gateway_id_timestamp ON sensor_data(gateway_id, timestamp DESC);


-- Insert sample admin user (password: admin123 for admin)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@kampungtani.com', '$2b$12$M99Sm1H.pamxjBZ36d0efuGeZ5EbjqNFSDlf34meSgG9HwD0i1rcO', 'admin'),