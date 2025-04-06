const mongoose = require("mongoose");

// User schema definition
const userSchema = new mongoose.Schema(
    {
        sub: { type: String, unique: true, required: true },
        email: { type: String, unique: true, required: true },
        username: { type: String, required: true },
        name: { type: String },
          role: { type: String, required: true },
          team: { type: String, default: "" },
          position: { type: String, default: "" },
          permissions: { type: [String], default: [] }, // List of permissions for RBAC
          createdAt: { 
            type: Date, 
            default: Date.now 
          },
          lastLogin: { 
            type: Date 
          }
    },
    { timestamps: true }
);

// Change the model name to 'AuthUser' to prevent overwriting
const Auth0User = mongoose.models.Auth0User || mongoose.model("Auth0User", userSchema);

module.exports = Auth0User;

