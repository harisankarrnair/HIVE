const mongoose = require('mongoose');

const SportsSchema = new mongoose.Schema({
  game: String,
  date: String,
  time: String,
  venue: String,
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Sports', SportsSchema);
