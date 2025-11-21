const AuthService = require("../services/AuthService");

/**
 * AuthController - Authentication HTTP Layer
 * Handles authentication requests
 */
class AuthController {
  /**
   * User login
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Email and password are required",
        });
      }

      // Authenticate user
      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      // Handle authentication errors
      if (error.message === "Invalid credentials") {
        return res.status(401).json({
          success: false,
          error: "Authentication Failed",
          message: error.message,
        });
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
