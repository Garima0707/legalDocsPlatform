const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema({
  email: String,
  documentId: String,
  role: { 
    type: String, 
    enum: ['viewer', 'editor', 'owner'], 
    default: 'viewer' 
  },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Refers to the user who invited them
});

const Collaborator = mongoose.model('Collaborator', collaboratorSchema);
module.exports = Collaborator;
