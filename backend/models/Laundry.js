const mongoose = require('mongoose');

const LaundrySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    tokenNumber: { 
        type: String, 
        required: true, 
        unique: true 
    }, // <-- NEW: Token for tracking
    slotTime: { 
        type: String, 
        required: true 
    }, // <-- NEW: Time slot booked
    date: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        default: 'Pending' // Pending, In Progress, Ready for Pickup, Completed
    }
});

module.exports = mongoose.model('Laundry', LaundrySchema);