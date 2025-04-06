const jsonwebtoken = require("jsonwebtoken");
require("dotenv").config();
const { expressjwt: expressJwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const axios = require("axios");
const crypto = require("crypto");
const RevokedToken = require("../models/RevokedToken");
const jwt = require("jsonwebtoken");

// Middleware to check if a token is revoked
const checkRevokedToken = async (req, res, next) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Missing token.",
        });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    try {
        const isRevoked = await RevokedToken.findOne({ token: hashedToken });
        if (isRevoked) {
            return res.status(403).json({
                success: false,
                message: "Token is revoked.",
            });
        }
        next();
    } catch (error) {
        console.error("Error checking revoked token:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while checking token revocation.",
        });
    }
};

// Middleware to verify a JWT manually (using a secret key)
const checkJwtCustom = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(403).json({ message: "Authentication token required" });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET); // Using jsonwebtoken for manual verification

        // Check if the token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ message: "Token expired" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        if (err.name === "JsonWebTokenError") {
            return res.status(400).json({ message: "Malformed token" });
        }
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Middleware to verify a JWT from Auth0 using express-jwt and jwks-rsa
const checkJwt = expressJwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `https://dev-712xsutkt7i7xp7o.us.auth0.com/.well-known/jwks.json`,
    }),
    audience: "GKokKlSVQIqhKSaEu43LMgRwJjgrZhJy", // Ensure this is correct
    issuer: `https://dev-712xsutkt7i7xp7o.us.auth0.com/`, // Ensure this is correct
    algorithms: ["RS256"],
    credentialsRequired: true,
});

// Fetch user info from Auth0 using Access Token
async function getUserInfo(accessToken) {
    try {
        const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;  // Return user data such as email, sub, etc.
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

const client = jwksRsa({
  jwksUri: `https://dev-712xsutkt7i7xp7o.us.auth0.com/.well-known/jwks.json`  // Replace with your Auth0 domain
});

// Function to get the key from Auth0 JWKS
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err, null);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Example of logging middleware for requests
const logRequest = (req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}, Time: ${new Date().toISOString()}`);
    next();
};

module.exports = {
    checkJwtCustom,
    checkJwt,
    checkRevokedToken,
    getUserInfo,
    logRequest,
};
