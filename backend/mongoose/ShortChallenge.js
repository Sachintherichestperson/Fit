const mongoose = require('mongoose');

const ShortSchema = new mongoose.Schema({
    ChallengeName: String,
    ChallengeDes: String,
    ChallengeEndDate: Date,
    ChallengeReward: String,
    ChallengeDifficulty: String,
    ChallengeCategory: String,
    ChallengePeriod: String,
    BigDescription: String,
    Proof: String,
    Instruction: String,
});

module.exports = mongoose.model('Short', ShortSchema);
