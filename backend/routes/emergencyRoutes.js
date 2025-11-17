const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const User = require('../models/User'); // Need the User model to fetch location data

// POST /api/emergencies - Raise a new alert
router.post('/', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ msg: "User ID is required to raise an emergency." });
    }

    try {
        // 1. Fetch necessary details from the User model
        const user = await User.findById(userId).select('name regNo block room');

        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        // 2. Create the new Emergency document
        const newAlert = new Emergency({
            userId: user._id,
            name: user.name,
            regNo: user.regNo,
            block: user.block,
            room: user.room,
        });

        await newAlert.save();

        // 3. Optional: Send a notification to admin staff here (e.g., via Notification model)
        
        res.status(201).json({ msg: 'Emergency alert successfully raised.', alert: newAlert });

    } catch (error) {
        console.error('Error raising emergency alert:', error);
        res.status(500).json({ msg: 'Failed to raise alert due to server error.', error: error.message });
    }
});

// GET /api/emergencies - Admin view (Get all active alerts)
router.get('/', async (req, res) => {
    try {
        const activeAlerts = await Emergency.find({ status: 'Active' }).sort({ raisedAt: 1 });
        res.json(activeAlerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ msg: 'Failed to fetch alerts.' });
    }
});

module.exports = router;