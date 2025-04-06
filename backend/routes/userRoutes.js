const express = require('express');
const User = require('../models/Users'); // Import the User model
const router = express.Router();

router.get('/test', (req, res) => res.send('User route works!'));

// Example route to get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error });
    }
});

// Example route to register a new user
router.post("/register", async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const newUser = new User({ email, username, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error registering user", error });
    }
});

// Export the router
module.exports = router;
