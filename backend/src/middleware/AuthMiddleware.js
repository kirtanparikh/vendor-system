const AuthService = require("../services/AuthService");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const decoded = AuthService.verifyToken(token);
  req.user = decoded;
  next();
}

module.exports = { authenticateToken };
