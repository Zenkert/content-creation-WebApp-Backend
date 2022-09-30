const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const introduction_Schema = new mongoose.Schema({

    introduction: {
        type: String,
        required: true
    },
    sequence: {
        type: Number,
        required: true
    },
    link: {
        type: String,
        required: false
    },
    file: {
        type: String,
        require: false
    },
    questionType: {
        type: String,
        default: 'introduction',
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

const Introduction = mongoose.model('introduction', introduction_Schema);
module.exports = Introduction;
