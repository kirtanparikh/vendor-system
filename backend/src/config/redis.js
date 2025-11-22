const redis = require("redis");

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initialize();
  }

  async initialize() {
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
            return new Error("Redis reconnection failed");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on("connect", () => {
      this.isConnected = true;
    });

    this.client.on("ready", () => {});

    this.client.on("error", (err) => {
      this.isConnected = false;
    });

    this.client.on("end", () => {
      this.isConnected = false;
    });

    await this.client.connect();
  }

  getClient() {
    return this.isConnected ? this.client : null;
  }

  isReady() {
    return this.isConnected && this.client && this.client.isReady;
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
