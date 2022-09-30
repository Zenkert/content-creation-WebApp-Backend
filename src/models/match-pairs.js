const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const matchPairsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },

    statement1: {
        type: String,
        required: false
    },

    answer1: {
        type: String,
        required: false
    },

    statement2: {
        type: String,
        required: false
    },

    answer2: {
        type: String,
        required: false
    },
    statement3: {
        type: String,
        required: false
    },
    answer3: {
        type: String,
        required: false
    },
    statement4: {
        type: String,
        required: false
    },
    answer4: {
        type: String,
        required: false
    },
    statement5: {
        type: String,
        required: false
    },
    answer5: {
        type: String,
        required: false
    },
    questionType: {
        type: String,
        default: 'matchPairs',
    },
    file: {
        type: String,
        require: false
    },
    statement6: {
        type: String,
        required: false
    },
    answer6: {
        type: String,
        required: false
    },
    // statement7: {
    //     type: String,
    //     required: false
    // },
    // answer7: {
    //     type: String,
    //     required: false
    // },
    // statement8: {
    //     type: String,
    //     required: false
    // },
    // answer8: {
    //     type: String,
    //     required: false
    // },
    posFeedback: {
        type: String,
        required: true
    },
    negFeedback: {
        type: String,
        required: true
    },
    sequence: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    topicId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "topic"
    }
    // subId: {
    //     type: Schema.Types.ObjectId,
    //     required: true,
    //     ref: "subject"
    // }
});

const Match_Pairs = mongoose.model('match_pairs', matchPairsSchema);
module.exports = Match_Pairs;
