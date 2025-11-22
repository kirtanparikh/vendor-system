const VendorService = require("../services/VendorService");

class VendorController {
  async createSubVendor(req, res) {
    const { name, email, password, parent_id, role, permissions } = req.body;
    const requesterId = req.user?.id || 1;
    const vendorData = { name, email, password, parent_id, role, permissions };
    const newVendor = await VendorService.createSubVendor(
      vendorData,
      requesterId
    );
    res.status(201).json({ data: newVendor });
  }

  async getHierarchy(req, res) {
    const hierarchy = await VendorService.getHierarchy();
    res.status(200).json({ data: hierarchy });
  }
}

module.exports = new VendorController();
