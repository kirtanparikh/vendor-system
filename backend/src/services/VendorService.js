const bcrypt = require("bcryptjs");
const VendorModel = require("../models/VendorModel");
const CacheService = require("./CacheService");

class VendorService {
  async createSubVendor(data, requesterId) {
    const requester = await VendorModel.findById(requesterId);
    if (!requester.permissions.can_create_subvendor) {
      throw new Error("Permission denied: cannot create subvendor");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const vendorData = {
      name: data.name,
      parent_id: data.parent_id || requesterId,
      role: data.role || "SUB_VENDOR",
      permissions: data.permissions || {},
      email: data.email,
      password: hashedPassword,
    };

    const newVendor = await VendorModel.create(vendorData);

    await CacheService.del("hierarchy_tree");

    return newVendor;
  }

  async getHierarchy() {
    const cacheKey = "hierarchy_tree";

    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const vendors = await VendorModel.findAll();

    const vendorMap = {};
    const roots = [];

    for (const vendor of vendors) {
      vendorMap[vendor.id] = {
        ...vendor,
        children: [],
      };
    }

    for (const vendor of vendors) {
      if (vendor.parent_id === null) {
        roots.push(vendorMap[vendor.id]);
      } else if (vendorMap[vendor.parent_id]) {
        vendorMap[vendor.parent_id].children.push(vendorMap[vendor.id]);
      }
    }

    const drivers = await VendorModel.findAllDrivers();
    for (const d of drivers) {
      const driverNode = {
        id: `driver-${d.id}`,
        name: d.name,
        role: "driver",
        attributes: {
          role: "driver",
          id: `D-${d.id}`,
          license_no: d.license_no,
        },
        children: [],
      };

      if (vendorMap[d.vendor_id]) {
        vendorMap[d.vendor_id].children.push(driverNode);
      }
    }

    const vehicles = await VendorModel.findAllVehicles();
    for (const v of vehicles) {
      const vehicleNode = {
        id: `veh-${v.id}`,
        name: v.reg_no,
        role: "vehicle",
        attributes: {
          role: "vehicle",
          id: `V-${v.id}`,
          model: v.model,
          status: v.status,
        },
        children: [],
      };

      if (vendorMap[v.vendor_id]) {
        vendorMap[v.vendor_id].children.push(vehicleNode);
      }
    }

    await CacheService.set(cacheKey, roots, 600);

    return roots;
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new VendorService();
