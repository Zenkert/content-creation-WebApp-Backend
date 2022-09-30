const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const true_falseSchema = new mongoose.Schema({

    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    sequence: {
        type: Number,
        required: true
    },
    posFeedback: {
        type: String,
        required: true
    },
    negFeedback: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        default: 'trueFalse',
    },
    file: {
        type: String,
        require: false
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
})

const True_false = mongoose.model('true_false', true_falseSchema);
module.exports = True_false;
