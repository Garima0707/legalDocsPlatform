const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamHead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  invites: [{ type: String }], // store email addresses of invitees
});

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
