const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const laundryRoutes = require('./routes/laundryRoutes');
const messRoutes = require('./routes/messRoutes');
const sportsRoutes = require('./routes/sportsRoutes');
const vmartRoutes = require('./routes/vmartRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/vmart', vmartRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergencies', emergencyRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // SUCCESS LOG
    console.log(`MongoDB Connected successfully to ${process.env.MONGO_URI}`); // <-- Check for this line
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    // ERROR LOG (CRITICAL)
    console.error('MongoDB Connection Error:', err.message); // <-- If you see this, the DB is the problem!
    // Optional: Log the URI if you suspect an issue with the string itself
    console.error('Connection URI attempted:', process.env.MONGO_URI); 
  });
  
