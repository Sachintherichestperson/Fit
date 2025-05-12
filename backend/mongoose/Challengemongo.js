const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
    ChallengeName: String,
    ChallengeType: String,
    ChallengeSubType: String,
    Gender: String,
    Duration: String,
    Status: String,
    CurrentWeight: String,
    TargetWeight: String,
    DifficultyLevel: String,
    Height: String,
    BMI: String,
});

module.exports = mongoose.model("Challenge", challengeSchema);