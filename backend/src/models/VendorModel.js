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
                email, password
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, parent_id, role, permissions,
                      email, created_at
        `;

    const values = [
      data.name,
      data.parent_id || null,
      data.role,
      JSON.stringify(data.permissions || {}),
      data.email,
      data.password,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll() {
    const query = `
            SELECT id, name, parent_id, role, permissions, email, created_at
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
      SELECT id, vendor_id, reg_no, model, status
      FROM vehicles
      ORDER BY id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findAllDrivers() {
    const query =
      "SELECT id, name, vendor_id, license_no FROM drivers ORDER BY id";
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = new VendorModel();
