const redisClient = require("../config/redis");

class CacheService {
  async get(key) {
    const client = redisClient.getClient();
    if (!client || !redisClient.isReady()) {
      return null;
    }
    const data = await client.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }

  async set(key, data, ttlSeconds = 600) {
    const client = redisClient.getClient();
    if (!client || !redisClient.isReady()) {
      return false;
    }
    const serialized = JSON.stringify(data);
    await client.setEx(key, ttlSeconds, serialized);
    return true;
  }

  async del(key) {
    const client = redisClient.getClient();
    if (!client || !redisClient.isReady()) {
      return false;
    }
    await client.del(key);
    return true;
  }

  async flush() {
    const client = redisClient.getClient();
    if (!client || !redisClient.isReady()) {
      return false;
    }
    await client.flushAll();
    return true;
  }
}

module.exports = new CacheService();
