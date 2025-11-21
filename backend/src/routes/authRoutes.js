const express = require("express");
const AuthController = require("../controllers/AuthController");

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", (req, res, next) => AuthController.login(req, res, next));

module.exports = router;
