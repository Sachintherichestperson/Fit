const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({

  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  Images: [String],
  Sold: Number,
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  stock: { type: Number, required: true }, 
  sku: { type: String },
  variantName: [{ type: String }], 
  variantPrice: [{ type: Number }],
  variantStock: [{ type: Number }],
  productSpecs: { type: String },
  shippingWeight: { type: Number },
  shippingLength: { type: Number },
  shippingWidth: { type: Number },
  shippingHeight: { type: Number },
  productTags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  views: { type: Number, default: 0 },
  Sold: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  trendingScore: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('Product', ProductSchema);
