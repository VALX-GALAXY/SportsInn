const redis = require("redis");

const redisOpts = {
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
  }
};
if (process.env.REDIS_PASSWORD) redisOpts.password = process.env.REDIS_PASSWORD;

let client;
try {
  client = redis.createClient(redisOpts);
  client.connect().catch(err => {
    console.warn("Redis connect failed:", err.message || err);
  });
} catch (err) {
  console.warn("Redis client error:", err.message || err);
  client = null;
}

module.exports = client;
