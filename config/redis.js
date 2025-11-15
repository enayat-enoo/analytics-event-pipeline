const Redis = require('ioredis');

// Initialize Redis client
const redis = new Redis();

module.exports = redis;