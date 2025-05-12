// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
      name: String,
      brand: String,
      price: Number,
      quantity: Number,
      pointsUsed: Number,
    }
  ],

  totalAmount: Number,
  pointsUsed: Number,

  shippingAddress: {
    fullName: String,
    mobile: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },

  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
