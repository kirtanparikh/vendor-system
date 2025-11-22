DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'SUB_VENDOR',
    parent_id INT REFERENCES vendors(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '{"can_onboard_driver": true, "can_onboard_vehicle": true, "can_create_subvendor": true, "can_verify": false}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    reg_no VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_no VARCHAR(50) UNIQUE NOT NULL,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL
);

INSERT INTO vendors (name, email, password, role, parent_id, permissions)
VALUES (
    'Root Super Vendor',
    'admin@cabsystem.com',
    '$2b$10$rKwLUKZ5E3jX9vQXqZ5vC.xN8hW7Kj6vL9pQ8tR3uV2wX4yZ6aB1C',
    'SUPER_VENDOR',
    NULL,
    '{"can_onboard_driver": true, "can_onboard_vehicle": true, "can_create_subvendor": true, "can_verify": true}'
) ON CONFLICT (email) DO NOTHING;
