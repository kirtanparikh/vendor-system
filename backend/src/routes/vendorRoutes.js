const express = require("express");
const VendorController = require("../controllers/VendorController");
const { authenticateToken } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.post("/", authenticateToken, (req, res, next) =>
  VendorController.createSubVendor(req, res, next)
);

router.get("/hierarchy", (req, res, next) =>
  VendorController.getHierarchy(req, res, next)
);

module.exports = router;
