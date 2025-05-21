const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  feePerDay: Number,
  Image: String,
  Reward: String,
  MaxParticipants: Number,
  razorpay_payment_id: String,
  totalFee: Number, // calculated as feePerDay * duration
  status: { type: String, enum: ['draft', 'upcoming', 'active', 'completed'], default: 'upcoming' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  DaysToStart: Number,
  Participants: Number,
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
