const mongoose = require('mongoose');
const ShortChallenge = require('./ShortChallenge');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    Mobile: String,
    fcmToken: String,
    password: String,
    Stake: String,
    // eslint-disable-next-line no-undef
    Photo: Buffer,
    CurrentWeight: String,
    Skip: Number,
    SelfChallenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
    },
    ActiveChallenge: {
        goal: String,
        description: String,
        completionRate: String,
        participants: String,
        difficulty: String,
        Type: String,
        Payment: Number,
        StartDate: Date,
        EndDate: Date,
        skipDate: Date,
        SkipEndDate: Date,
        Proof: String,
        Instruction: String,
    },
    AssignedPresentChallenge: {
        goal: String,
        description: String,
        completionRate: String,
        participants: String,
        difficulty: String,
        Type: String,
        Proof: String,
        Instruction: String,
    },
    ChallengeOver: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
    }],
    AssignedChallenges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assigned',
    }],
    ShortActiveChallenge: [{
        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Short',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        CompleteRate: String,
        CheckInDate: Date,
        UserProof: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'Proof',
        },
        DaysCompleted: Number,
        ChallengeStatus: String,
    }],
    Cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
    }],
    Orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: ' Order',
    }],
    StreetNumber: String,
    Address: String,
    City: String,
    State: String,
});

module.exports = mongoose.model('User', userSchema);
