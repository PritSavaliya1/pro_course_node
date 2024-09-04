const redis = require('redis');

const client = redis.createClient({
  url: 'redis://127.0.0.1:6379'  
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});


client.connect().catch(err => {
  console.error('Failed to connect to Redis:', err);
});

module.exports = client;