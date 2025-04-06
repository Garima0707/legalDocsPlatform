// generateSecret.js
const crypto = require('crypto');

// Generate a random 32-byte secret, convert it to a base64 string
const secret = crypto.randomBytes(32).toString('base64');
console.log('Generated JWT Secret:', secret);
