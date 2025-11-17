const mongoose = require('mongoose');
const ComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  description: String,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Complaint', ComplaintSchema);
