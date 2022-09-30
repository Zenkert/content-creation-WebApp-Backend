const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const openEndedAnswers = new mongoose.Schema({
    answer: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: String,
        required: true
    },
    questionId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    }
});

const OpenEndedAnswer = mongoose.model('OpenEndedAnswer', openEndedAnswers);
module.exports = OpenEndedAnswer;
