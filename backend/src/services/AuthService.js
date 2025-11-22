const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const VendorModel = require("../models/VendorModel");

class AuthService {
  async login(email, password) {
    const vendor = await VendorModel.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(
      password,
      vendor.password_hash
    );

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

  verifyToken(token) {
    const jwtSecret =
      process.env.JWT_SECRET || "default_secret_change_in_production";
    return jwt.verify(token, jwtSecret);
  }
}

module.exports = new AuthService();
