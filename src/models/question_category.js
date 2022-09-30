const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionTypeSchema = new mongoose.Schema({
    questionType: {
        type: String,
        required: true
    }
});
const QuestionType = mongoose.model('Type', questionTypeSchema);
module.exports = QuestionType;
