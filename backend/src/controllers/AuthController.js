const AuthService = require("../services/AuthService");

class AuthController {
  async login(req, res, next) {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  }
}

module.exports = new AuthController();
