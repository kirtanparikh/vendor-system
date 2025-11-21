const bcrypt = require("bcryptjs");
const VendorModel = require("../models/VendorModel");
const CacheService = require("./CacheService");

/**
 * VendorService - Business Logic Layer
 * Handles business rules and data transformation
 */
class VendorService {
  /**
   * Create a sub-vendor
   * @param {Object} data - Vendor data
   * @param {number} requesterId - ID of the requester creating the vendor
   * @returns {Promise<Object>} Created vendor
   */
  async createSubVendor(data, requesterId) {
    // Validate requester exists
    if (requesterId) {
      const requester = await VendorModel.findById(requesterId);
      if (!requester) {
        throw new Error("Requester not found");
      }
    }

    // Check if email already exists
    const existingVendor = await VendorModel.findByEmail(data.email);
    if (existingVendor) {
      throw new Error("Email already exists");
    }

    // Hash password with salt rounds = 10
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Prepare vendor data
    const vendorData = {
      name: data.name,
      parent_id: data.parent_id || requesterId,
      role: data.role || "vendor",
      permissions: data.permissions || {},
      email: data.email,
      password: hashedPassword, // Will be mapped to password_hash in model
      contact_number: data.contact_number,
      address: data.address,
    };

    // Create vendor
    const newVendor = await VendorModel.create(vendorData);

    // Invalidate cache after creating new vendor
    await CacheService.del("vendor_hierarchy");
    console.log("Cache invalidated: vendor_hierarchy");

    // Remove password_hash from response
    delete newVendor.password_hash;

    return newVendor;
  }

  /**
   * Get vendor hierarchy in tree structure
   * O(N) time complexity - two loops, no recursion
   * @returns {Promise<Array>} Hierarchy tree
   */
  async getHierarchy() {
    const cacheKey = "vendor_hierarchy";

    // Try to get from cache first
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      console.log("CACHE HIT: vendor_hierarchy");
      return cachedData;
    }

    console.log("CACHE MISS: vendor_hierarchy");

    // Fetch all vendors from database
    const vendors = await VendorModel.findAll();

    // Build tree in O(N) time using Map
    const vendorMap = {};
    const roots = [];

    // First loop: Create map of all vendors
    for (const vendor of vendors) {
      vendorMap[vendor.id] = {
        ...vendor,
        children: [],
      };
    }

    // Second loop: Link children to parents
    for (const vendor of vendors) {
      if (vendor.parent_id === null) {
        // Root node
        roots.push(vendorMap[vendor.id]);
      } else if (vendorMap[vendor.parent_id]) {
        // Add to parent's children
        vendorMap[vendor.parent_id].children.push(vendorMap[vendor.id]);
      }
    }

    // Cache the result for 10 minutes (600 seconds)
    await CacheService.set(cacheKey, roots, 600);

    return roots;
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new VendorService();
