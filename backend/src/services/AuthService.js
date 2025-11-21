const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const VendorModel = require("../models/VendorModel");

/**
 * AuthService - Authentication Business Logic
 * Handles login and token generation
 */
class AuthService {
  /**
   * User login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Token and user data
   */
  async login(email, password) {
    // Find vendor by email
    const vendor = await VendorModel.findByEmail(email);

    if (!vendor) {
      throw new Error("Invalid credentials");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      vendor.password_hash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const jwtSecret =
      process.env.JWT_SECRET || "default_secret_change_in_production";
    const token = jwt.sign(
      {
        id: vendor.id,
        email: vendor.email,
        role: vendor.role,
      },
      jwtSecret,
      {
        expiresIn: "24h",
      }
    );

    // Prepare user object (exclude password_hash)
    const user = {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      role: vendor.role,
      permissions: vendor.permissions,
      parent_id: vendor.parent_id,
      contact_number: vendor.contact_number,
      status: vendor.status,
    };

    return { token, user };
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    const jwtSecret =
      process.env.JWT_SECRET || "default_secret_change_in_production";
    return jwt.verify(token, jwtSecret);
  }
}

module.exports = new AuthService();
