const mongoose = require('mongoose');

const VmartItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantityAvailable: { type: Number, required: true },
    // 🚩 NEW FIELD: Category for grouping
    category: { type: String, required: true }
});

module.exports = mongoose.model('VmartItem', VmartItemSchema);