const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { isDocumentOwner } = require('../middleware/auth');

router.get(
  '/documents/:documentId/invitees',
  permissionController.getInvitees
);

router.put(
  '/documents/:documentId/permissions',
  isDocumentOwner,
  permissionController.updatePermissions
);

router.post(
  '/documents/:documentId/owners/promote',
  isDocumentOwner,
  permissionController.promoteToOwner
);

router.delete(
  '/documents/:documentId/owners/remove',
  isDocumentOwner,
  permissionController.removeOwner
);

router.post(
  '/invitees/generateInviteCodes',
  isDocumentOwner,
  permissionController.generateInviteCodes
);

module.exports = router;