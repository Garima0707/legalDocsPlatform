const { expressjwt: auth } = require("express-jwt"); // Correct import
const jwksRsa = require("jwks-rsa");

// Auth middleware
const checkJwtAuth0 = auth({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: `https://dev-712xsutkt7i7xp7o.us.auth0.com/.well-known/jwks.json`,
  }),
  audience: "GKokKlSVQIqhKSaEu43LMgRwJjgrZhJy",
  issuer: `https://dev-712xsutkt7i7xp7o.us.auth0.com/`,
  algorithms: ["RS256"],
});

// Simulate middleware usage
console.log("Middleware loaded successfully:", typeof checkJwtAuth0 === "function");

console.log("Middleware loaded successfully!");
