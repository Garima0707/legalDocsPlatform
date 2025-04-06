const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true }, // Store Auth0 user ID
  email: { type: String, required: true, unique: true },
  name: { type: String },
  picture: { type: String },  // Optional: Store Auth0 profile picture
  username: { type: String, required: true },
  role: { type: String, default: "member" }, // Default role can be changed based on your needs
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password validation method
userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
