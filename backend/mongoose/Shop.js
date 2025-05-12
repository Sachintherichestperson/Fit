const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    Title: String,
    Description: String,
    Price: String,
    Image: Buffer,
    Category: String,
    Quantity: String,
    Orders: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order',
    }],
});

module.exports = mongoose.model('Shop', shopSchema);
