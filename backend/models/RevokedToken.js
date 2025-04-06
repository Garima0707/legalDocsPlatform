const mongoose = require("mongoose");

const revokedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  revokedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RevokedToken", revokedTokenSchema);
