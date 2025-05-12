const mongoose = require('mongoose');

const ApproveSchema = new mongoose.Schema({
    // eslint-disable-next-line no-undef
    Proof: Buffer,
    Challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Short'
    },
    Status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Proof', ApproveSchema);
