const express = require("express");
const VendorController = require("../controllers/VendorController");

const router = express.Router();

/**
 * @route   POST /api/vendors
 * @desc    Create a new sub-vendor
 * @access  Protected (will be protected after auth implementation)
 */
router.post("/", (req, res, next) =>
  VendorController.createSubVendor(req, res, next)
);

/**
 * @route   GET /api/vendors/hierarchy
 * @desc    Get vendor hierarchy tree
 * @access  Protected (will be protected after auth implementation)
 */
router.get("/hierarchy", (req, res, next) =>
  VendorController.getHierarchy(req, res, next)
);

module.exports = router;
