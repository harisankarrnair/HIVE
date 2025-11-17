const express = require('express');
const router = express.Router();
const Laundry = require('../models/Laundry');
const mongoose = require('mongoose'); // Necessary for converting ID strings

// 1. POST /: Add new laundry request (Booking a slot) with 7-day rule enforcement
router.post('/', async (req, res) => {
    try {
        const { userId, slotTime, tokenNumber } = req.body;

        if (!userId || !slotTime || !tokenNumber) {
            return res.status(400).json({ msg: 'Missing required booking information.' });
        }

        // --- ENFORCEMENT OF 7-DAY RULE ---
        const sevenDaysAgo = new Date();
        // Calculate the exact timestamp 7 days ago
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Convert the string userId to a Mongoose ObjectId for correct querying
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        // Find the most recent booking for this user made on or after 7 days ago.
        const recentBooking = await Laundry.findOne({
            userId: userObjectId, 
            date: { $gte: sevenDaysAgo } 
        }).sort({ date: -1 });

        if (recentBooking) {
            // If a booking is found within the last 7 days, block the new booking.
            const lastBookingDate = new Date(recentBooking.date).toLocaleDateString('en-US');
            return res.status(403).json({ 
                msg: `You can only book one laundry slot every seven days. Your last booking was on ${lastBookingDate}.`
            });
        }
        // ----------------------------------

        // If the check passes, proceed to save the new booking
        const laundry = new Laundry({
            userId: userObjectId, // Use the converted ObjectId for saving
            slotTime,
            tokenNumber,
            status: 'Pending'
        });
        
        const savedBooking = await laundry.save();
        res.status(201).json(savedBooking);

    } catch (error) {
        console.error('Error booking laundry slot:', error);
        
        // Handle specific Mongoose/MongoDB errors (like token uniqueness error)
        if (error.code === 11000) {
             return res.status(409).json({ msg: 'Token number already exists (Try booking again) or a conflict occurred.' });
        }
        // Handle potential invalid ObjectId error if the userId format is wrong
        if (error.name === 'CastError') {
             return res.status(400).json({ msg: 'Invalid User ID format.' });
        }
        res.status(500).json({ msg: 'Failed to save booking. Check server logs for details.' });
    }
});


// 2. GET /track/:token: Get laundry request status by Token Number (Tracking)
// NOTE: This endpoint provides status for ANY valid token, violating privacy. 
// True security requires passing the userId and checking ownership, but this 
// matches the current UI requirement for token-based tracking.
router.get('/track/:token', async (req, res) => {
    try {
        const token = req.params.token.toUpperCase();
        
        const laundry = await Laundry.findOne({ tokenNumber: token });

        if (!laundry) {
            return res.status(404).json({ 
                status: 'Not Found', 
                details: 'No laundry found with this token number.' 
            });
        }
        
        // Return simplified status and details for the frontend
        res.json({
            status: laundry.status,
            details: `Your clothes were dropped off for the ${laundry.slotTime} slot on ${new Date(laundry.date).toLocaleDateString()}`
        });
    } catch (error) {
        console.error('Error tracking laundry:', error);
        res.status(500).json({ msg: 'Server error during tracking.' });
    }
});


// 3. GET /: Get all laundry requests (Admin/Staff use)
router.get('/', async (req, res) => {
    const all = await Laundry.find().populate('userId').sort({ date: -1 });
    res.json(all);
});

module.exports = router;