// models/OAuthToken.js
  //This model defines the schema for storing the refresh tokens in the MongoDB database.
  const mongoose = require('mongoose');

  const OAuthTokenSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true },
  });

  const OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema);

  module.exports = OAuthToken;
