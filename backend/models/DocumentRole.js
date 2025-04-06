//models/DocumentRole.js
const mongoose = require('mongoose');

const documentRoleSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true }
});

const DocumentRole = mongoose.model('DocumentRole', documentRoleSchema);

module.exports = DocumentRole;
