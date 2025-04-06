const Invite = require("../models/Invite");
const { Web3 } = require("web3");
const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const Collaborator = require("../models/Collaborator");

// Initialize Web3 and connect to Ganache
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL || "http://127.0.0.1:7545"));

// Signing endpoint
const signDocument = async (req, res) => {
    const { email } = req.body;
    const { documentId } = req.params;

    try {
        // Check if an invite exists for this email and document
        const invite = await Invite.findOne({ email, documentId });
        if (!invite) {
            return res.status(404).json({ message: "No invite found for this email and document." });
        }

        // Check if the user has the 'owner' role
        if (invite.role !== "owner") {
            return res.status(403).json({ message: "You are not authorized to sign this document." });
        }

        // Simulate signing the document on the blockchain
        const accounts = await web3.eth.getAccounts(); // Fetch accounts from Ganache
        const signerAccount = accounts[0]; // Use the first account for signing

        // Create a transaction with no value (doesn't cost anything to the user)
        const transaction = await web3.eth.sendTransaction({
            from: signerAccount,
            to: signerAccount, // Transaction to self for demonstration purposes
            data: web3.utils.asciiToHex(`Signed Document: ${documentId}`), // Optional metadata
        });

        console.log("Transaction successful:", transaction);

        // Update the invite status or document metadata as needed
        return res.status(200).json({ message: "Document signed successfully.", transaction });
    } catch (error) {
        console.error("Error signing document:", error);
        return res.status(500).json({ message: "An error occurred while signing the document." });
    }
};

// Middleware to check RBAC
const checkPermissions = (requiredPermission) => {
    return async (req, res, next) => {
      const { email, documentId } = req.body;
  
      try {
        const collaborator = await Collaborator.findOne({ email, documentId });
  
        if (!collaborator) {
          return res.status(403).json({ success: false, message: "Access denied. User not a collaborator." });
        }
  
        const rolePermissions = {
          viewer: ["read"],
          editor: ["read", "update", "save"],
          owner: ["read", "update", "save", "sign"],
        };
  
        const userPermissions = rolePermissions[collaborator.role] || [];
  
        if (!userPermissions.includes(requiredPermission)) {
          return res.status(403).json({ success: false, message: `Permission '${requiredPermission}' denied.` });
        }
  
        req.collaborator = collaborator; // Pass collaborator info to next middleware
        next();
      } catch (error) {
        console.error("Permission check error:", error);
        res.status(500).json({ success: false, message: "Server error." });
      }
    };
  };
  
  // Example routes
  
  // Route to view a document (read)
  router.post("/document/view", checkPermissions("read"), async (req, res) => {
    const { documentId } = req.body;
  
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }
  
    res.json({ success: true, document });
  });
  
  // Route to update a document
  router.post("/document/update", checkPermissions("update"), async (req, res) => {
    const { documentId, content } = req.body;
  
    await Document.findByIdAndUpdate(documentId, { content });
    res.json({ success: true, message: "Document updated successfully." });
  });
  
  // Route to sign a document
  router.post("/document/sign", checkPermissions("sign"), async (req, res) => {
    const { documentId } = req.body;
  
    // Perform sign logic (e.g., blockchain signing)
    res.json({ success: true, message: "Document signed successfully." });
  });

module.exports = { signDocument, checkPermissions };

