const { pool } = require("../config/db");

/**
 * VendorModel - Repository Layer
 * Handles all database operations for vendors
 */
class VendorModel {
  /**
   * Find vendor by email
   * @param {string} email - Vendor email
   * @returns {Promise<Object|null>} Vendor object or null
   */
  async findByEmail(email) {
    const query = "SELECT * FROM vendors WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Create a new vendor
   * @param {Object} data - Vendor data
   * @returns {Promise<Object>} Created vendor
   */
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

  /**
   * Find all vendors for hierarchy building
   * @returns {Promise<Array>} Array of vendors
   */
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

  /**
   * Find vendor by ID
   * @param {number} id - Vendor ID
   * @returns {Promise<Object|null>} Vendor object or null
   */
  async findById(id) {
    const query = "SELECT * FROM vendors WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new VendorModel();
