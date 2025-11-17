const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// Login (basic)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ msg: "Invalid" });
  res.json(user);
});

// Get all registered users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚩 NEW ROUTE: Update User Profile by ID (PATCH/PUT)
router.patch('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Fields allowed for update: exclude email and password for security/simplicity
        const { name, regNo, room, block } = req.body; 

        if (!name || !regNo || !room || !block) {
            return res.status(400).json({ msg: 'All profile fields are required for update.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, regNo, room, block },
            { new: true, runValidators: true } // Return the updated doc, run Mongoose validation
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Return the updated user object
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ msg: 'Failed to update profile.', error: error.message });
    }
});
module.exports = router;
