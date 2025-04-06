// controllers/permissionController.js
const DocumentPermission = require('../models/DocumentRole');
const Document = require('../models/Document');

const permissionController = {
  // Get all invitees and owners for a document
  async getInvitees(req, res) {
    try {
      const { documentId } = req.params;
      const userEmail = req.user.email;

      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // If user is not an owner, check if they have been invited
      if (!document.isOwner(userEmail)) {
        const hasAccess = await DocumentPermission.exists({ 
          documentId, 
          email: userEmail 
        });
        if (!hasAccess) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      const invitees = await DocumentPermission.find({ documentId })
        .select('-__v')
        .sort({ createdAt: -1 });

      res.json({ 
        invitees,
        owners: document.owners,
        isOwner: document.isOwner(userEmail),
        originalCreator: document.createdBy
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching invitees', error: error.message });
    }
  },

  // Promote an invitee to owner
  async promoteToOwner(req, res) {
    try {
      const { documentId } = req.params;
      const { email } = req.body;

      const document = await Document.findById(documentId);
      const permission = await DocumentPermission.findOne({ documentId, email });

      if (!permission) {
        return res.status(404).json({ message: 'User not found in document permissions' });
      }

      // Add user to owners list
      document.addOwner(email);
      
      // Update their role to Owner
      permission.role = 'Owner';
      permission.permissionsSet = true;

      await Promise.all([document.save(), permission.save()]);

      res.json({ 
        message: 'User promoted to owner successfully',
        owners: document.owners
      });
    } catch (error) {
      res.status(500).json({ message: 'Error promoting user to owner', error: error.message });
    }
  },

  // Remove owner status from a user
  async removeOwner(req, res) {
    try {
      const { documentId } = req.params;
      const { email } = req.body;
      const requestingUserEmail = req.user.email;

      const document = await Document.findById(documentId);

      // Prevent self-removal if last owner
      if (email === requestingUserEmail && document.owners.length <= 1) {
        return res.status(400).json({ 
          message: 'Cannot remove the last owner of the document' 
        });
      }

      document.removeOwner(email);
      
      // Update their role to Admin
      const permission = await DocumentPermission.findOne({ documentId, email });
      if (permission) {
        permission.role = 'Admin';
        await permission.save();
      }

      await document.save();

      res.json({ 
        message: 'Owner removed successfully',
        owners: document.owners
      });
    } catch (error) {
      res.status(500).json({ message: 'Error removing owner', error: error.message });
    }
  },

  // Generate invite codes - now supports multiple owners
  async generateInviteCodes(req, res) {
    try {
      const { documentId, emails } = req.body;
      const userEmail = req.user.email;

      const inviteCodes = [];
      const errors = [];
      
      for (const email of emails) {
        try {
          // Check if user is already an owner
          if (req.document.owners.includes(email)) {
            errors.push(`${email} is already a document owner`);
            continue;
          }

          // Check if permission already exists
          const existingPermission = await DocumentPermission.findOne({ 
            documentId, 
            email 
          });

          if (existingPermission) {
            errors.push(`${email} has already been invited`);
            continue;
          }

          // Create new permission record
          const permission = await DocumentPermission.create({
            documentId,
            email,
            invitedBy: userEmail,
            permissionsSet: false
          });

          const inviteCode = generateInviteCode();
          
          inviteCodes.push({
            email,
            inviteCode,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          });
        } catch (error) {
          errors.push(`Error processing ${email}: ${error.message}`);
        }
      }

      res.json({ 
        inviteCodes,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      res.status(500).json({ message: 'Error generating invite codes', error: error.message });
    }
  }
};

// Helper function to generate invite codes
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

module.exports = permissionController;
