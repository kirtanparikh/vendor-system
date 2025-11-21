DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'vendor')),
    permissions JSONB DEFAULT '{}',
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES vendors(id) ON DELETE SET NULL
);

CREATE INDEX idx_vendors_parent_id ON vendors(parent_id);
CREATE INDEX idx_vendors_role ON vendors(role);
CREATE INDEX idx_vendors_status ON vendors(status);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    year INTEGER,
    capacity INTEGER,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
    registration_date DATE,
    insurance_expiry DATE,
    pollution_cert_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_vendor_id ON vehicles(vendor_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_number ON vehicles(vehicle_number);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    license_expiry DATE,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    date_of_birth DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    experience_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE INDEX idx_drivers_vendor_id ON drivers(vendor_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_license ON drivers(license_number);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin vendor (password: admin123 - bcrypt hash)
INSERT INTO vendors (name, parent_id, role, permissions, email, password_hash, contact_number, status)
VALUES (
    'System Admin',
    NULL,
    'admin',
    '{"canCreateVendors": true, "canDeleteVendors": true, "canManageRoles": true, "canViewAll": true}',
    'admin@vendorsystem.com',
    '$2a$10$rZ5YvCqOXXCnEqF0JXQ7ZOYxBXqXLFfqJKZ6xGZQ8XqQ8XqQ8XqQ8',
    '+1234567890',
    'active'
);
