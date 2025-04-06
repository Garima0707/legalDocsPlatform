const RevokedToken = require("../models/RevokedToken");
const crypto = require("crypto");

const checkRevokedToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token is required" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const revoked = await RevokedToken.findOne({ token: hashedToken });
    if (revoked) {
      return res.status(401).json({ success: false, message: "Token has been revoked." });
    }
    next();
  } catch (err) {
    console.error("Error checking revoked token:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { checkRevokedToken };
