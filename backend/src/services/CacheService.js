const redisClient = require("../config/redis");

/**
 * CacheService - Redis Wrapper Class
 * Provides caching functionality with graceful degradation
 */
class CacheService {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Parsed data or null
   */
  async get(key) {
    try {
      const client = redisClient.getClient();

      // If Redis is not available, return null gracefully
      if (!client || !redisClient.isReady()) {
        console.warn("Cache unavailable: Redis not connected");
        return null;
      }

      const data = await client.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error("Cache get error:", error.message);
      // Graceful degradation - return null if cache fails
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, data, ttlSeconds = 600) {
    try {
      const client = redisClient.getClient();

      // If Redis is not available, fail gracefully
      if (!client || !redisClient.isReady()) {
        console.warn("Cache unavailable: Redis not connected");
        return false;
      }

      const serialized = JSON.stringify(data);
      await client.setEx(key, ttlSeconds, serialized);

      return true;
    } catch (error) {
      console.error("Cache set error:", error.message);
      // Graceful degradation - don't crash the app
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      const client = redisClient.getClient();

      // If Redis is not available, fail gracefully
      if (!client || !redisClient.isReady()) {
        console.warn("Cache unavailable: Redis not connected");
        return false;
      }

      await client.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error.message);
      // Graceful degradation - don't crash the app
      return false;
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} Success status
   */
  async flush() {
    try {
      const client = redisClient.getClient();

      if (!client || !redisClient.isReady()) {
        console.warn("Cache unavailable: Redis not connected");
        return false;
      }

      await client.flushAll();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error.message);
      return false;
    }
  }
}

module.exports = new CacheService();
