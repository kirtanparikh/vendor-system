const AuthService = require("../services/AuthService");

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
function authenticateToken(req, res, next) {
  try {
    // Get authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Access token is required",
      });
    }

    // Verify token
    try {
      const decoded = AuthService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Authentication error",
    });
  }
}

module.exports = { authenticateToken };
