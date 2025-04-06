const mongoose = require("mongoose");
const cron = require("node-cron");

// Document schema definition
const documentSchema = new mongoose.Schema({
  documentId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["land", "contract", "will"], required: true },
  createdBy: { type: String, required: true}, // Corrected reference to 'AuthUser'
  expiresAt: { type: Date }, // Optional expiration
  savedAsDraft: { type: Boolean, default: false },
  content: { type: String },
  iv: { type: String },
    status: { type: String, default: 'draft' }, // 'draft' or 'saved'
    collaborators: { type: [String], default: [] }, // Array of collaborator emails
    createdAt: { type: Date, default: Date.now }, // Timestamp for drafts
    lastModified: { type: Date, default: Date.now },
    editHistory:{type: [
      {
          date: { type: Date, required: true }, // Timestamp of the edit
          editor: { type: String, required: true }, // Email or identifier of the editor
          changes: { type: String, required: true } // Summary of changes
      }
  ],
  default: [],},
    isSigned: { type: Boolean, default: false },
    signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // User who signed
    signedAt: Date,
    role: { type: String, default: 'owner' },
    status: {
      type: String,
      enum: ['draft', 'saved', 'signed', 'rejected'],
      default: 'draft'
  },
    signedBy: {
      type: String
  },
  signedAt: {
      type: Date
  },
  blockchainInfo: {
      blockNumber: {
          type: Number
      },
      transactionHash: {
          type: String
      },
      signedAt: {
          type: Date
      }
    },
},
{ timestamps: true });

// Cron job to delete expired drafts every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      await DocumentModel.deleteMany({ status: 'draft', createdAt: { $lt: thirtyDaysAgo } });
      console.log('Deleted drafts older than 30 days.');
  } catch (error) {
      console.error('Error deleting old drafts:', error);
  }
});

// Create or retrieve Document model
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = Document;
