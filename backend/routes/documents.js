const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Document = require("../models/Document");
const Invite = require("../models/Invite");
const { signDocument } = require("../controller/documentController");
const crypto = require("crypto");
const { encryptContent } = require('../utils/cryptoUtils');

// Middleware to parse JSON requests
router.use(express.json());

// Create a document
router.post("/create", async (req, res) => {
  const { title, description, type, createdBy } = req.body;

  // Ensure that the necessary fields are provided
  if (!title || !description || !type || !createdBy) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Generate a 64-character hex ID directly (32 bytes = 64 hex chars)
    const documentId = crypto.randomBytes(32).toString('hex'); // 32 bytes = 64 hex chars
    console.log("Generated document ID:", documentId);

    // Create a new document with the details and associate it with the user's email and role
    const newDocument = new Document({
      title,
      description,
      type,
      createdBy, // Save the email of the user who created the document
      role: 'owner', // Default role as 'owner'
      createdAt: new Date(),
      documentId, // The generated document ID
    });

    // Save the document to the database
    const savedDocument = await newDocument.save();
    console.log("Saved document ID:", savedDocument.documentId);

    // Send success response with document details
    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      document: {
        ...savedDocument.toObject(),
        documentId: savedDocument.documentId, // Send the generated hex documentId
      }
    });
  } catch (error) {
    console.error("Error creating document:", error.stack || error.message || error); // Better error logging
    res.status(500).json({ error: "Error creating document" });
  }
});

// Get list of invitees for a document
router.get("/list/:documentId", async (req, res) => {
    const { documentId } = req.params;
  
    try {
      const invitees = await Collaborator.find({ documentId }).populate("invitedBy", "email");
      if (!invitees || invitees.length === 0) {
        return res.status(404).json({ success: false, message: "No invitees found." });
      }
  
      const formattedInvitees = invitees.map((invitee) => ({
        email: invitee.email,
        status: invitee.status || "Verified",
        role: invitee.role || "Collaborator",
        invitedBy: invitee.invitedBy?.email || null,
      }));
  
      res.status(200).json({ success: true, invitees: formattedInvitees });
    } catch (error) {
      console.error("Error fetching invitees:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  });

  // Route to get all documents
router.get("/", async (req, res) => {
    try {
      const documents = await Document.find().sort({ createdAt: -1 }); // Fetch documents in descending order
      res.status(200).json({ success: true, documents });
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ success: false, message: "Error fetching documents" });
    }
  });

  router.post('/updateDocument', async (req, res) => {
    try {
      const { documentId, content, status } = req.body;
  
      if (!documentId || !content) {
        return res.status(400).json({ message: 'Document ID and content are required' });
      }
  
      // No encryption, just use the content as it is
      const updatedDocument = await Document.findOneAndUpdate(
        { documentId }, // Use the documentId field to find the document
        { content: content, status: status || 'saved', lastEdited: new Date() }, // Store plain content
        { new: true } // Return the updated document
      );
  
      if (updatedDocument) {
        return res.status(200).json({
          message: 'Document updated successfully',
          updatedDocument,
        });
      } else {
        return res.status(404).json({ message: 'Document not found' });
      }
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


router.post('/save-document', async (req, res) => {
  const { documentId, content } = req.body;

  try {
      // Validate documentId format
      if (!mongoose.Types.ObjectId.isValid(documentId)) {
          return res.status(400).json({ error: 'Invalid document ID format.' });
      }

      // Fetch and update document
      const document = await Document.findById(documentId);

      if (!document) {
          return res.status(404).json({ error: 'Document not found.' });
      }

      document.content = content || document.content;
      document.lastModified = new Date();

      await document.save();
      return res.status(200).json({ message: 'Document autosaved successfully.' });
  } catch (error) {
      console.error('Error autosaving document:', error.message);
      return res.status(500).json({ error: 'Failed to autosave document.' });
  }
});


router.get('/getAllDocuments', async (req, res) => {
    try {
        const documents = await Document.find({}, 'title status createdBy createdAt'); // Fetch only required fields
        res.status(200).json({ documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents.' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ error: 'Document not found.' });
        }

        if (document.status === 'signed') {
            return res.status(403).json({ error: 'Cannot delete a signed document.' });
        }

        await Document.findByIdAndDelete(id);
        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document.' });
    }
});

// Route to check user role before signing
router.get('/role/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const invite = await Invite.findOne({ email });
        if (!invite) {
            return res.status(404).json({ error: 'Invite not found.' });
        }

        res.status(200).json({ role: invite.role });
    } catch (error) {
        console.error('Error fetching invite:', error);
        res.status(500).json({ error: 'Server error while fetching role.' });
    }
});

// Get Document by ID
router.get('/getDocumentById/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    // Input validation
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }

    // Clean and validate document ID format
    const cleanDocId = documentId.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(cleanDocId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    // Find document using the documentId field (not _id)
    const document = await Document.findOne({ documentId: cleanDocId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Decrypt the content using the IV and encrypted content
    const decryptedContent = decryptContent(document.iv, document.content);

    // Return formatted document data with decrypted content
    res.status(200).json({
      success: true,
      document: {
        documentId: document.documentId,
        title: document.title || 'Untitled',
        description: document.description || '',
        content: decryptedContent || '', // Send the decrypted content
        docType: document.docType || '',
        lastModified: document.lastEdited,
        status: document.status
      }
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

function decryptContent(iv, encryptedContent, encryptionKey) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Route to sign the document
router.post("/signDocument/:documentId", signDocument);

router.post('/updateStatus', async (req, res) => {
  const { documentId, status } = req.body;

  if (!documentId || !status) {
    return res.status(400).json({ error: "Document ID and status are required" });
  }

  try {
    // Update the document's status in the database
    const updatedDocument = await Document.findOneAndUpdate(
      { documentId },
      { status },
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: 'Document status updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ error: "Error updating document status" });
  }
});

const isValidDocumentId = (id) => /^[a-fA-F0-9]{64}$/.test(id);
router.get("/document/:documentId", async (req, res) => {
  const { documentId } = req.params;

  console.log("Received documentId:", documentId);

  // Validate documentId format (64 hexadecimal characters)
  if (!isValidDocumentId(documentId)) {
    return res.status(400).json({ message: "Invalid documentId format." });
  }

  try {
    // Fetch document based on the documentId (string field, not _id)
    const document = await Document.findOne({ documentId: documentId });

    if (!document) {
      console.error("Document not found for documentId:", documentId);
      return res.status(404).json({ message: "Document not found." });
    }

    // Return document details
    return res.status(200).json({
      documentId: document.documentId,
      title: document.title,
      description: document.description,
      content: document.content || "",
      role: document.role,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(500).json({ message: "Server error." });
  }
});
module.exports = router;
