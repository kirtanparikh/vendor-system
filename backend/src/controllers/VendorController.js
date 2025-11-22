const VendorService = require("../services/VendorService");

class VendorController {
  async createSubVendor(req, res, next) {
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
  }

  async getHierarchy(req, res, next) {
    const hierarchy = await VendorService.getHierarchy();

    res.status(200).json({
      success: true,
      message: "Hierarchy retrieved successfully",
      data: hierarchy,
    });
  }
}

module.exports = new VendorController();
