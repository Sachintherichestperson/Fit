const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who placed the order
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true }, // which brand's product
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true } // price locked at order time
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
  deliveryAddress: String,  // or embedded address object
  transactionId: String,    // payment gateway transaction id
});

module.exports = mongoose.model('Order', OrderSchema);
