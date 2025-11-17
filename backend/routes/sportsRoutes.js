const express = require('express');
const router = express.Router();
const Sports = require('../models/Sports');
const mongoose = require('mongoose');

// ... (router.get('/') with .populate remains the same) ...

// 🚩 MODIFIED ROUTE: Register a user for an existing event
router.post('/', async (req, res) => {
    try {
        const { id: eventId, userId } = req.body;
        
        if (!eventId || !userId) {
            return res.status(400).json({ msg: 'Event ID and User ID are required for registration.' });
        }

        // Convert string IDs to Mongoose ObjectId for correct querying
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const eventObjectId = new mongoose.Types.ObjectId(eventId);

        // 1. Check if the user is ALREADY registered (prevents duplicates)
        const existingEvent = await Sports.findById(eventObjectId);
        if (existingEvent && existingEvent.registeredUsers.includes(userObjectId)) {
             return res.status(409).json({ msg: 'You are already registered for this event.' });
        }

        // 2. Use $push to atomically add the userId to the registeredUsers array
        const updatedEvent = await Sports.findByIdAndUpdate(
            eventObjectId,
            { $push: { registeredUsers: userObjectId } },
            { new: true } // Return the modified document
        ).populate({
            path: 'registeredUsers',
            select: 'name regNo'
        }); // Populate the updated list for the frontend confirmation

        if (!updatedEvent) {
            return res.status(404).json({ msg: 'Event not found.' });
        }

        // Success: Return the updated event data
        res.json(updatedEvent);

    } catch (error) {
        console.error('Error in Sports Registration:', error);
        res.status(500).json({ msg: 'Failed to complete registration.', error: error.message });
    }
});
// 🚩 MODIFIED ROUTE: Get all sports events and POPULATE user details
router.get('/', async (req, res) => {
    try {
        const events = await Sports.find()
            // Populate the registeredUsers array. 
            // Select only the name and regNo fields from the User model.
            .populate({
                path: 'registeredUsers',
                select: 'name regNo' 
            });

        res.json(events);
    } catch (error) {
        console.error('Error fetching sports events:', error);
        res.status(500).json({ msg: 'Failed to fetch events.' });
    }
});

// Register or list events (POST route remains the same for registration logic)


module.exports = router;