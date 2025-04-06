const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  documentId: { type: String, required: true},
  expiresAt: { type: Date, required: true },
  status: { type: String, default: "pending" },
  role: { 
    type: String, 
    enum: ['viewer', 'editor', 'owner'], 
    default: 'viewer' 
  },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Invite = mongoose.model("Invite", inviteSchema);
module.exports = Invite;
