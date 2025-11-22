const { pool } = require("../config/db");

class VendorModel {
  async findByEmail(email) {
    const query = "SELECT * FROM vendors WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async create(data) {
    const query = `
            INSERT INTO vendors (
                name, parent_id, role, permissions,
                email, password_hash, contact_number, address
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, parent_id, role, permissions,
                      email, contact_number, address, status, created_at
        `;

    const values = [
      data.name,
      data.parent_id || null,
      data.role,
      JSON.stringify(data.permissions || {}),
      data.email,
      data.password, // Already hashed, mapped to password_hash
      data.contact_number || null,
      data.address || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll() {
    const query = `
            SELECT id, name, parent_id, role, permissions, email,
                   contact_number, status, created_at
            FROM vendors
            ORDER BY id
        `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = "SELECT * FROM vendors WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findAllVehicles() {
    const query = `
      SELECT id, vendor_id, vehicle_number, vehicle_type, model, status, created_at
      FROM vehicles
      ORDER BY id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findAllDrivers() {
    const query =
      "SELECT id, name, vendor_id, license_number, status FROM drivers ORDER BY id";
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = new VendorModel();
