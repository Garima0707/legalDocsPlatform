// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { Auth0User } = require('../models/Users');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database
    const user = await Auth0User.findOne({ sub: decoded.sub });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check document access permissions
const checkDocumentAccess = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const collaborator = await Collaborator.findOne({ 
      documentId, 
      userId 
    });

    if (!collaborator) {
      return res.status(403).json({ 
        error: 'You do not have access to this document' 
      });
    }

    // Add collaborator info to request
    req.collaborator = collaborator;
    next();
  } catch (error) {
    console.error('Document access check error:', error);
    res.status(500).json({ error: 'Failed to check document access' });
  }
};  

const saveAuth0UserToDatabase = async (req, res, next) => {
  try {
    const { sub, email, name } = req.localUser;

    let user = await Auth0User.findOne({ sub });

    if (!user) {
      user = new Auth0User({
        sub,
        email,
        name,
        roles: ['User'], // Default role
        createdAt: new Date()
      });
      await user.save();
    }

    req.localUser = user;
    next();
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
};

module.exports = {
  authMiddleware,
  checkDocumentAccess,
  saveAuth0UserToDatabase
};
