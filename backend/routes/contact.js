const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// Handle contact form submission
router.post("/submit", async (req, res) => {
  const { name, company, email, subject, message } = req.body;

  try {
    // Create a new contact entry
    const newContact = new Contact({ name, company, email, subject, message });
    const savedContact = await newContact.save();

    res.status(201).json({
      success: true,
      message: "Contact details submitted successfully",
      data: savedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit contact details",
      error: error.message,
    });
  }
});

module.exports = router;
