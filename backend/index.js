const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const { checkJwt} = require("./middleware/checkJwt"); // JWT middleware
const { saveAuth0UserToDatabase } = require("./middleware/authMiddleware"); // Auth middleware to save user to DB
const { logAudit } = require("./utils/auditLogger"); // Audit logging function
const documentRoutes = require("./routes/documents");
const inviteRoutes = require("./routes/invite");
const contactRoutes = require("./routes/contact");
const authRoutes = require("./routes/auth");
const analyticsRoutes = require('./routes/analyticsRoutes');
require("dotenv").config();
const session = require("express-session");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// Secret Key
const SECRET_KEY = process.env.SECRET_KEY || crypto.randomBytes(64).toString("hex");

// MongoDB Connection
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware Setup
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

// Set up express-session
app.use(session({
  secret: 'your-secret-key',  // Change this to a secret string for session encryption
  resave: false,              // Do not resave session if not modified
  saveUninitialized: true,    // Save uninitialized session
  cookie: { secure: false }   // Set to true if using HTTPS
}));

// Passport Setup for Auth0
passport.use(
  new Auth0Strategy(
    {
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
      callbackURL:  process.env.AUTH0_CALLBACK_URL
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      // Save or update user details in MongoDB after Auth0 login
      saveAuth0UserToDatabase(profile, done);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  // You would find the user by ID and return the user object
  User.findById(id).then((user) => done(null, user));
});

app.use(passport.initialize());
app.use(passport.session());

// Models
const RevokedToken = require("./models/RevokedToken");
const AuditLog = require("./models/AuditLog");
const Invite = require("./models/Invite");
const Document = require("./models/Document");
const User = require("./models/Users"); // Add User model for saving Auth0 users
app.use('/api/documents/create', documentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/invitees", inviteRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Auth0 Routes (Login, Callback, Logout)
app.get("/login", (req, res) => {
  res.send('<a href="/auth0">Login with Auth0</a>');
});

app.get("/auth0", passport.authenticate("auth0", { scope: "openid profile email" }));

app.get(
  "/api/auth/callback",
  passport.authenticate("auth0", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.send(`Hello ${req.user.name}`);
});

// Login Route
/*app.get("/login", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("No token provided.");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.send(`Welcome! Your token is valid. User email: ${decoded.email}`);
  } catch (err) {
    res.status(400).send("Invalid or expired token.");
  }
});*/

// Token Revocation Endpoint
app.post("/api/invite/revoke", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required." });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    await RevokedToken.create({ token: hashedToken });
    await logAudit("TOKEN_REVOCATION", { tokenId: hashedToken }); // Log the revocation

    res.json({ success: true, message: "Token revoked successfully." });
  } catch (err) {
    console.error("Error revoking token:", err);
    res.status(500).json({ success: false, message: "Failed to revoke token." });
  }
});

// Save Document as Draft
app.post("/api/documents/saveAsDraft", checkJwt, async (req, res) => {
  const { title, content, docType, expiresAt } = req.body;

  if (!title || !content || !docType || !expiresAt) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Create and save the draft with the createdBy field set to the logged-in user
  const draft = new Document({
    title,
    content,
    docType,
    expiresAt,
    savedAsDraft: true,
    createdBy: req.user.email, // Associate the draft with the logged-in user
  });

  try {
    await draft.save();
    res.status(200).json({ message: "Draft saved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error saving draft." });
  }
});

// Fetch Saved Drafts
app.get("/api/documents/drafts", checkJwt, async (req, res) => {
  try {
    // Fetch drafts associated with the logged-in user
    const drafts = await Document.find({ savedAsDraft: true, createdBy: req.user._id });
    res.status(200).json(drafts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching drafts." });
  }
});

app.get('/profile', checkJwt, async (req, res) => {
  const accessToken = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
  try {
    const userInfo = await getUserInfo(accessToken);
    res.json(userInfo);  // Return user profile info
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user info' });
  }
});

// 2. Fetch Document Details with Access Control
app.get("/documents/:documentId", async (req, res) => {
  const { documentId } = req.params;
  const { userEmail } = req.query; // Assume the user's email is sent in the query

  try {
    const document = await Document.findOne({ documentId }).populate("invitees");

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Check if the user has access
    const user = await User.findOne({ email: userEmail });
    if (!user || !document.invitees.some((invitee) => invitee.email === userEmail)) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Return document if access is granted
    res.status(200).json({
      title: document.title,
      content: document.content,
      permissions: user.permissions,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: "Error fetching document.", error });
  }
});

// 3. List Invitees for a Document
app.get("/api/invitees/:documentId", async (req, res) => {
  const { documentId } = req.params;

  try {
    const document = await Document.findOne({ documentId }).populate("invitees");

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.status(200).json(document.invitees);
  } catch (error) {
    console.error("Error fetching invitees:", error);
    res.status(500).json({ message: "Error fetching invitees.", error });
  }
});

// Verify if email is associated with the document (Invite Model)
app.get('/api/invitees/verify/:email/:documentId', async (req, res) => {
  try {
      const { email, documentId } = req.params;
      const invite = await Invite.findOne({ email, documentId });
      if (invite) {
          return res.json(invite);
      } else {
          return res.status(404).json({ message: "Invite not found" });
      }
  } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
