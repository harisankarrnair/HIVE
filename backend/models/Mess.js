const mongoose = require('mongoose');

const MessSchema = new mongoose.Schema({
    // We will use this model for BOTH menu data and user feedback data
    mealType: { type: String, required: true }, // Breakfast, Lunch, Dinner, Feedback
    items: [String], // Used primarily for storing menu items
    date: { type: Date, default: Date.now },
    
    // 🚩 MODIFIED FIELDS for capturing feedback
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Associate feedback with a user
    rating: { type: Number, min: 0, max: 5 }, // New field for star rating
    feedback: { type: String } // The text comment
});

module.exports = mongoose.model('Mess', MessSchema);