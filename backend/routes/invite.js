const express = require("express");
const jwt = require("jsonwebtoken");
const { logAudit } = require("../utils/auditLogger");
const Invite = require("../models/Invite");
const Document = require("../models/Document");
const Collaborator = require('../models/Collaborator');
require("dotenv").config();
const crypto = require("crypto");
const Users = require("../models/Users");


const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in the environment variables.");
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Generate invite codes for collaborators
router.post("/generateInviteCodes/:documentId", async (req, res) => {
  const { documentId } = req.params; // Fetch documentId from URL parameter
  const { invitees } = req.body;

  // Input validation
  if (!documentId || !Array.isArray(invitees) || invitees.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid input: Missing documentId or invitees." });
  }

  try {
    // Find the document by the provided documentId (byte32 format)
    const document = await Document.findOne({ documentId }); // Assuming documentId is stored as a field in the document
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    // Process each invitee and generate an invite code
    const inviteCodes = invitees.map(({ email, role }) => {
      if (!email || !role) {
        throw new Error(`Missing email or role for invitee: ${email || "Unknown"}`);
      }

      // Generate the invite code using email, documentId, and role
      const inviteCode = crypto
        .createHash("sha256")
        .update(`${email}-${documentId}-${role}`)
        .digest("hex");

      // Set expiration date (1 day from now)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1);

      return {
        email, 
        role, 
        inviteCode, 
        documentId, 
        expiresAt: expirationDate 
      };
    });

    // Insert generated invite codes into the database
    await Invite.insertMany(inviteCodes);
    
    // Respond with success and generated invite codes
    res.status(200).json({ success: true, inviteCodes });
  } catch (error) {
    console.error("Error generating invite codes:", error);
    res.status(500).json({ success: false, message: error.message || "Server error." });
  }
});

// Verify invite code and grant document access
router.post("/verifyInviteCode", async (req, res) => {
  const { email, inviteCode } = req.body;

  try {
      // Fetch invite
      const invite = await Invite.findOne({ email, inviteCode });
      console.log('Invite:', invite); // Debug log
      if (!invite) {
          return res.status(404).json({ message: 'Invalid email or invite code.' });
      }

      // Extract documentId from the invite
    const { documentId } = invite;

      // Fetch document
      const document = await Document.findOne({documentId});
      console.log('Document:', document); // Debug log
      if (!document) {
          return res.status(404).json({ message: 'Document not found.' });
      }

      return res.status(200).json({
          documentId: document.documentId,
          title: document.title,
          description: document.description,
          content: document.content,
          role: invite.role, // Pass the user's role
          permissions: invite.permissions, // Optional: any permissions
      });
  } catch (error) {
      console.error('Error verifying invite:', error);
      return res.status(500).json({ message: 'Server error.' });
  }
});


router.post("/findByInviteCode", async (req, res) => {
  const { inviteCode, email } = req.body;

  if (!inviteCode || !email) {
    return res.status(400).json({ success: false, message: "Invite code and email are required." });
  }

  try {
    // Find the invite by email and invite code
    const invite = await Invite.findOne({ inviteCode, email });
    if (!invite) {
      return res.status(404).json({ success: false, message: "Invite not found." });
    }

    // Find the document associated with the invite using documentId
    const document = await Document.findOne({ documentId: invite.documentId });
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    res.json({ success: true, documentId: document.documentId });
  } catch (error) {
    console.error("Error finding document:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
}); 

router.get("/invitees/:documentId", async (req, res) => {
  try {
    // Find all invites with the documentId and return only the email field
    const invites = await Invite.find({ documentId: req.params.documentId }).select('email');
    res.json(invites); // Return the result as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching invites");
  }
});

// Backend: Express route to check invite role
router.get("/invites/role/:email/:documentId", async (req, res) => {
  const { email, documentId } = req.params;

  try {
      const invite = await Invite.findOne({ email, documentId });

      if (!invite) {
          return res.status(404).json({ success: false, message: "Invite not found" });
      }

      return res.status(200).json({ success: true, role: invite.role });
  } catch (error) {
      console.error("Error fetching invite:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
