const mongoose = require('mongoose');

const AssignedSchema = new mongoose.Schema({
    AssignedChallenge: [String],
    AssignedChallengeDescription: [String],
    AssignedChallengeDuration: [String],
    AssignedChallengeDifficulty: [String],
    AssignedChallengeCompletionRate: [String],
    AssignedChallengeParticipants: [String],
    AssignedforUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    AssignedProof: [String],
    AssignedInstruction: [String]
});

// eslint-disable-next-line eol-last
module.exports = mongoose.model('Assigned', AssignedSchema);