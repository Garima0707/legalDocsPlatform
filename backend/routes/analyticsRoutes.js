const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

router.get('/get-analytics/:documentId', async (req, res) => {
    const { documentId } = req.params;

    try {
        // Validate documentId format
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ error: 'Invalid document ID format.' });
        }

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ error: 'Document not found.' });
        }

        const analytics = {
            editHistory: document.editHistory || [], // Assuming editHistory is an array
            collaborators: document.collaborators || [],
            lastModified: document.lastModified,
        };

        return res.status(200).json({ analytics });
    } catch (error) {
        console.error('Error fetching analytics:', error.message);
        return res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
});

module.exports = router;
