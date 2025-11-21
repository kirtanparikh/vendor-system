const VendorService = require("../services/VendorService");

/**
 * VendorController - HTTP Layer
 * Handles HTTP requests and responses
 */
class VendorController {
  /**
   * Create a sub-vendor
   * POST /api/vendors
   */
  async createSubVendor(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        parent_id,
        role,
        permissions,
        contact_number,
        address,
      } = req.body;

      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Name, email, and password are required",
        });
      }

      // Get requester ID from authenticated user
      const requesterId = req.user?.id || 1;

      const vendorData = {
        name,
        email,
        password,
        parent_id,
        role,
        permissions,
        contact_number,
        address,
      };

      const newVendor = await VendorService.createSubVendor(
        vendorData,
        requesterId
      );

      res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        data: newVendor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor hierarchy
   * GET /api/vendors/hierarchy
   */
  async getHierarchy(req, res, next) {
    try {
      const hierarchy = await VendorService.getHierarchy();

      res.status(200).json({
        success: true,
        message: "Hierarchy retrieved successfully",
        data: hierarchy,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VendorController();
