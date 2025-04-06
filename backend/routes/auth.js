// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { 
  saveAuth0UserToDatabase, 
  authMiddleware,
  checkDocumentAccess,
  checkRoleEditPermission 
} = require("../middleware/authMiddleware");
const { Auth0User } = require('../models/User');

const router = express.Router();

// Rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many login attempts. Try again later." },
});

// Login route
router.post("/login", loginLimiter, authMiddleware, saveAuth0UserToDatabase, async (req, res) => {
    try {
        const { sub, email } = req.localUser;

        // Update last login time
        await Auth0User.findOneAndUpdate(
            { sub },
            { lastLogin: new Date() }
        );

        // Create a JWT token with user roles
        const token = jwt.sign(
            { 
                sub, 
                email,
                roles: req.localUser.roles 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({ 
            token, 
            user: {
                email: req.localUser.email,
                name: req.localUser.name,
                roles: req.localUser.roles
            },
            message: "Login successful" 
        });
    } catch (error) {
        console.error("Login error:", error.message || error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Registration route
/*router.post("/register", authMiddleware, saveAuth0UserToDatabase, (req, res) => {
    try {
        res.status(201).json({ 
            message: "User registered successfully", 
            user: {
                email: req.localUser.email,
                name: req.localUser.name,
                roles: req.localUser.roles
            }
        });
    } catch (error) {
        console.error("Registration error:", error.message || error);
        res.status(500).json({ error: "Internal server error." });
    }
});*/

// Fetch current user route
router.get("/currentUser", authMiddleware, async (req, res) => {
    try {
        const user = await Auth0User.findOne({ sub: req.user.sub });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            email: user.email,
            name: user.name,
            roles: user.roles,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error("Error fetching user:", error.message || error);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

// Get user's document permissions
router.get("/permissions/:documentId", authMiddleware, checkDocumentAccess, async (req, res) => {
    try {
        res.json({
            role: req.collaborator.role,
            permissions: req.collaborator.permission
        });
    } catch (error) {
        console.error("Error fetching permissions:", error);
        res.status(500).json({ error: "Failed to fetch permissions" });
    }
});

module.exports = router;
