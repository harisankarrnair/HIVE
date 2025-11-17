const express = require('express');
const router = express.Router();
const Mess = require('../models/Mess');

// Get menu
router.get('/', async (req, res) => {
    // This route is typically used for fetching the menu, not feedback data
    const all = await Mess.find({ mealType: { $ne: 'Feedback' } }).sort({ date: -1 });
    res.json(all);
});

// 🚩 MODIFIED ROUTE: Add meal details (or save user feedback)
router.post('/', async (req, res) => {
    try {
        const { userId, mealType, rating, feedback } = req.body;
        
        if (mealType === 'Feedback') {
            // Logic for saving user feedback
            if (!userId || rating === undefined || rating === null) {
                return res.status(400).json({ msg: "User ID and Rating are required for feedback." });
            }
            const newFeedback = new Mess({
                userId,
                mealType: 'Feedback', // Use a consistent type for easy querying later
                rating,
                feedback,
                date: new Date()
            });
            const savedFeedback = await newFeedback.save();
            return res.status(201).json(savedFeedback);

        } else {
            // Logic for adding menu items (assuming staff role)
            const meal = new Mess(req.body);
            await meal.save();
            return res.json(meal);
        }

    } catch (error) {
        console.error('Error saving mess data:', error);
        res.status(500).json({ msg: 'Failed to save mess entry or feedback.', error: error.message });
    }
});

module.exports = router;