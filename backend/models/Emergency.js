const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
    // Link to the user who raised the alert
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Store user location details for quick response (populated from User model)
    name: String,
    regNo: String,
    block: String,
    room: String,
    
    // Status of the alert
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'Dismissed'],
        default: 'Active'
    },
    // Timestamp for when the alert was raised
    raisedAt: {
        type: Date,
        default: Date.now
    },
    // Optional field for admin notes or resolution details
    resolutionNotes: String
});

module.exports = mongoose.model('Emergency', EmergencySchema);