const crypto = require('crypto');

// Define a constant for your encryption key (ensure it's the same key used for encryption)
const ENCRYPTION_KEY = 'my_32_byte_secret_key_for_encryption_123'; // 32 bytes key for AES-256-CBC
const IV_LENGTH = 16; // AES block size for IV

// AES Encryption function
const encryptContent = (content) => {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(content, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return the IV (as a hexadecimal string) and the encrypted content
  return { iv: iv.toString('hex'), encryptedContent: encrypted };
};

// AES Decryption function
const decryptContent = (ivHex, encryptedContent) => {
  const iv = Buffer.from(ivHex, 'hex'); // Convert the IV from hex to Buffer
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedContent, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  
  return decrypted;
};

module.exports = { encryptContent, decryptContent };
