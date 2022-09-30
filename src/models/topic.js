const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const True_false = require('../models/true_false');
const Mcqs = require('../models/mcqs');
const Open_Ended = require('../models/open-ended');
const Introduction = require('../models/introduction');
const Match_Pairs = require('../models/match-pairs');

const topicSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        unique: true
    },
    ageGroup: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    noOfQuestions: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    access: {
        type: Boolean,
        required: false
    },
    accessCode: {
        type: String,
        required: false
    },
    remainingQuestions: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    subId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "subject"
    },
    ageId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "ageGroup"
    },
    subject: {
        type: String,
        required: true
    }
});

topicSchema.pre('remove', async function (next) {
    try {

        await Open_Ended.remove({
            "topicId": {
                $in: this._id
            }
        }),
        await True_false.remove({
              "topicId": {
                  $in: this._id
               }
         })
         await Mcqs.remove({
            "topicId": {
                $in: this._id
            }
        }),
        await Introduction.remove({
            "topicId": {
                $in: this._id
            }
        }),
        await Match_Pairs.remove({
            "topicId": {
                $in: this._id
            }
        })
        next();
    } catch (err) {
        next(err);

    }
});

const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;
