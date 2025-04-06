const mongoose = require('mongoose');

const inviteeSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Username or identifier
  approvalStatus: { type: String, default: 'pending' }, // 'pending', 'approved', 'rejected'
});

const Invitee = mongoose.model('Invitee', inviteeSchema);

module.exports = Invitee;
