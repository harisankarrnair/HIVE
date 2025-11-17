const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// 🚩 MODIFIED ROUTE: Get complaints for a SPECIFIC USER
// This endpoint now expects a user ID in the query, e.g., /api/complaints?userId=123
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query; 

        if (!userId) {
            // If the user ID is missing, return an error or an empty list, 
            // depending on security rules. Returning 400 is safer.
            return res.status(400).json({ msg: 'User ID is required to fetch complaints.' });
        }

        // Mongoose query to find complaints where the userId field matches the query parameter
        const complaints = await Complaint.find({ userId: userId }).sort({ date: -1 });
        
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        res.status(500).json({ msg: 'Failed to fetch complaints.', error: error.message });
    }
});

// Submit complaint (No change needed here, it still accepts the full complaint body including userId)
router.post('/', async (req, res) => {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.json(complaint);
});

// Update Complaint Status by ID (PATCH route remains unchanged)
router.patch('/:id', async (req, res) => {
    // ... (Your existing PATCH logic)
});

module.exports = router;