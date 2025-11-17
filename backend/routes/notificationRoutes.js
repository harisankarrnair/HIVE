const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Create notification
router.post('/', async (req, res) => {
  const notif = new Notification(req.body);
  await notif.save();
  res.json(notif);
});

// Fetch all notifications
router.get('/', async (req, res) => {
  const notifs = await Notification.find().sort({ createdAt: -1 });
  res.json(notifs);
});

module.exports = router;
