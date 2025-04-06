const AuditLog = require("../models/AuditLog");

exports.logAudit = async (action, metadata) => {
  try {
    const log = new AuditLog({ action, metadata });
    await log.save();
    console.log(`Audit logged: ${action}`);
  } catch (err) {
    console.error("Error logging audit:", err);
  }
};
