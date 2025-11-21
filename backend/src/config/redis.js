const redis = require("redis");

/**
 * Redis Client Configuration
 * Creates and manages Redis connection
 */
class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initialize();
  }

  /**
   * Initialize Redis client
   */
  async initialize() {
    try {
      // Build connection URL from environment variables
      const redisUrl =
        process.env.REDIS_URL ||
        `redis://${process.env.REDIS_HOST || "localhost"}:${
          process.env.REDIS_PORT || 6379
        }`;

      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error("Redis: Max reconnection attempts reached");
              return new Error("Redis reconnection failed");
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      // Event handlers
      this.client.on("connect", () => {
        console.log("✓ Redis connected successfully");
        this.isConnected = true;
      });

      this.client.on("ready", () => {
        console.log("✓ Redis client ready");
      });

      this.client.on("error", (err) => {
        console.error("Redis error:", err.message);
        this.isConnected = false;
      });

      this.client.on("end", () => {
        console.log("Redis connection closed");
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
    } catch (error) {
      console.error("Failed to initialize Redis:", error.message);
      this.isConnected = false;
    }
  }

  /**
   * Get the Redis client instance
   * @returns {Object|null} Redis client or null if not connected
   */
  getClient() {
    return this.isConnected ? this.client : null;
  }

  /**
   * Check if Redis is connected
   * @returns {boolean} Connection status
   */
  isReady() {
    return this.isConnected && this.client && this.client.isReady;
  }
}

// Create singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;
