const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  date: { type: Date, required: true },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
