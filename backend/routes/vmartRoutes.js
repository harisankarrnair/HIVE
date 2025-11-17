const express = require('express');
const router = express.Router();
const VmartItem = require('../models/VmartItem');

// Add item (POST route remains the same, but now requires the 'category' field in the body)
router.post('/', async (req, res) => {
    try {
        const item = new VmartItem(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        console.error('Error adding Vmart item:', error);
        res.status(500).json({ msg: 'Failed to add item.', error: error.message });
    }
});

// 🚩 MODIFIED ROUTE: Get all items and group them by category
router.get('/', async (req, res) => {
    try {
        const items = await VmartItem.find().sort({ category: 1, name: 1 });
        
        // Group items by category (manual restructuring for frontend UI)
        const groupedItems = items.reduce((acc, item) => {
            const categoryName = item.category;
            
            // Check if the category array already exists
            let categoryGroup = acc.find(group => group.category === categoryName);
            
            if (!categoryGroup) {
                // If not, create the category group
                categoryGroup = {
                    category: categoryName,
                    items: []
                };
                acc.push(categoryGroup);
            }

            // Push the item into the correct category group
            categoryGroup.items.push({
                id: item._id, // Use _id for the frontend key
                name: item.name,
                price: item.price,
                count: item.quantityAvailable 
            });

            return acc;
        }, []);

        res.json(groupedItems);
    } catch (error) {
        console.error('Error fetching Vmart items:', error);
        res.status(500).json({ msg: 'Failed to fetch Vmart stock.', error: error.message });
    }
});

module.exports = router;