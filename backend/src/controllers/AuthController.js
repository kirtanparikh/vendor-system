const AuthService = require("../services/AuthService");

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  }
}

module.exports = new AuthController();
