const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Loads environment variables from a .env file into process.env
require('dotenv').config(); 

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Allows parsing of application/json request bodies

// --- Route Imports ---
// Ensure you have all required modules in your backend/routes directory
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const laundryRoutes = require('./routes/laundryRoutes');
const messRoutes = require('./routes/messRoutes');
const sportsRoutes = require('./routes/sportsRoutes');
const vmartRoutes = require('./routes/vmartRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


// --- Database Connection Setup (Adapted for Serverless) ---

/**
 * Handles connecting to MongoDB. 
 * Checks if a connection already exists to prevent duplication in serverless environment.
 */
const connectDB = async () => {
    // If connection status is 1 (connected) or 2 (connecting), return.
    if (mongoose.connections[0].readyState) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        throw new Error('Database connection failed.');
    }
};

// --- Route Definitions ---
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/vmart', vmartRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);


// --- Serverless Export vs. Local Listen ---

// If running locally (not production and not Vercel), connect and listen
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server started locally on port ${PORT}`);
            });
        })
        .catch(err => console.error(err));

} else {
    // 💡 VERCEL EXPORT: Wrap the app handler in a database connection function.
    // This function will be exported and used by Vercel's serverless environment.
    module.exports = async (req, res) => {
        // Ensure connection is established before processing the request
        await connectDB(); 
        // Pass the request to the Express application instance
        return app(req, res); 
    };
}