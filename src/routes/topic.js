const Topic = require('../models/topic');
const express = require('express');
const router = express.Router();
var ObjectId = require('mongodb').ObjectId
const Open_Ended = require('../models/open-ended');
const Mcqs = require('../models/mcqs');
const True_false = require('../models/true_false');
const Introduction = require('../models/introduction');
const Match_Pairs = require('../models/match-pairs')

// Create new topic

const createTopics = async function (req, res) {
    // Check if this Topic already exisits
    let topic = await Topic.findOne({ topic: req.body.topic });
    if (topic) {
        return res.status(400).send('That topic already exists!');
    } else {
        let accessVariable, accessCodeVariable
        if (req.body.access === null) {
            accessVariable = false
            accessCodeVariable = ""
        } else {
            accessVariable = true
            accessCodeVariable = req.body.accessCode
        }
        // Insert the new topic if they do not exist yet
        topic = new Topic({
            topic: req.body.topic,
            ageGroup: req.body.ageGroup,
            language: req.body.language,
            country: req.body.country,
            grade: req.body.grade,
            noOfQuestions: req.body.noOfQuestions,
            remainingQuestions: req.body.noOfQuestions,
            time: req.body.time,
            subject: req.body.subject,
            // access: req.body.access,
            // accessCode: req.body.accessCode,
            access: accessVariable,
            accessCode: accessCodeVariable,
            subId: req.params.subId,
            userId: req.params.userId,
            ageId: req.params.ageId
        });
        await topic.save();
        res.send(topic);
    }
};

// Get All topics
// const getAllTopics = function (req, res) {
//     Topic.find()
//         .then(data => {
//             var message = "";
//             if (data === undefined || data.length == 0) message = "No Topic found!";
//             else message = 'Topics successfully retrieved';

//             res.send(data);
//         }).catch(err => {
//             res.status(500).send({
//                 success: false,
//                 message: err.message || "Some error occurred while retrieving Topics."
//             });
//         });
// }

// Get All topics
const getTopicDataByQuery = function (req, res) {
    Topic.find()
        .then(data => {
            const filters = req.query;
            const filteredData = data.filter(topicData => {
                let isValid = true;
                for (key in filters) {
                    isValid = isValid && topicData[key] == filters[key];
                }
                return isValid;
            });
            res.send(filteredData);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Topics."
            });
        });
}

// Get topic by topic id and user id
const getTopicsById = function (req, res) {
    Topic.findOne({ userId: req.params.userId, _id: req.params.id })
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No Topic found!";
            else message = 'Topics successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Topics."
            });
        });
}


// Get topics by age Id
const getTopicByAgeId = function (req, res) {
    Topic.find({ userId: req.params.userId, subId: req.params.subId, ageId: req.params.ageId })
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No Topic found!";
            else message = 'Topics successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(400).send(err + 'Some error occured')
        })
}

// Get topics by userId and sub id
const getTopicBySubjectId = function (req, res) {
    Topic.find({ userId: req.params.userId, subId: req.params.subId })
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No Topic found!";
            else message = 'Topics successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(400).send(err + ' Some error occured')
        })
}

// Get topic by userID
const getTopicByUserId = function (req, res) {
    Topic.find({ userId: req.params.userId })
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No Topic found!";
            else message = 'Topics successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(400).send('Some error occured')
        })
}

// Get topic by userID
const getTopicByTopicId = function (req, res) {
    Topic.findOne({ _id: req.params.id })
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No Topic found!";
            else message = 'Topics successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(400).send('Some error occured')
        })
}

// Delete topic by topic id and all its depended questions
function topic_delete(req, res, next) {
    Topic.findById({ _id: req.params.id })
        .then(topic => {
            if (!topic) {
                return next('The topic you requested could not be found.')
            }
            // Mcqs.remove({ topicId: topic._id }).exec();
            // Open_Ended.remove({ topicId: topic._id }).exec();
            // True_false.remove({ topicId: topic._id }).exec();
            // Introduction.remove({ topicId: topic._id }).exec();
            // Match_Pairs.remove({ topicId: topic._id }).exec();
            topic.remove();
            return res.status(200).send('Topic deleted');

        }).catch(err => {
            console.log(err)
            if (err.kind === 'ObjectId') {
                return next(res.status(404).send({
                    success: false,
                    message: "Topic not found with id "
                }));
            }
            return next(res.status(500).send({
                success: false,
                message: "Error retrieving Topic with id "
            }));
        });
};

// Unique topic name check
const getUnique_topic = function (req, res) {
    Topic.findOne({
        topic: {
            $regex: new RegExp(req.params.topic, "i")
        }
    })
        .then(data => {
            var message = "";
            console.log(data)
            if (data === undefined || data.length === 0 || data === null) message = "No Topic found!";
            else message = 'Topics successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(404).send({})
        })
}

// get topic by name
const getTopicByName = function (req, res) {
    Topic.findOne({ topic: req.params.topic })
        .then(data => {
            if (!data) {
                res.status(404).send('No Topic found!')
            }
            else {
                res.status(200).send(data)
            }
        }).catch(err => {
            res.status(500).send('Some error occured' + err)
        })
}

// const getQuestionsByTopicId = function (req, res) {
//     console.log('hello')
//     Topic.aggregate([
//         { $match: { _id: new ObjectId(req.params.id) } },
//         {
//             $lookup: {
//                 from: "mcqs",
//                 localField: "_id",
//                 foreignField: "topicId",
//                 pipeline: [{
//                     $sort: {
//                         sequence: 1
//                     }
//                 }],
//                 as: "topics_mcqs_info"
//             },
//         },
//         {
//             $lookup: {
//                 from: "true_falses",
//                 localField: "_id",
//                 foreignField: "topicId",
//                 pipeline: [{
//                     $sort: {
//                         sequence: 1
//                     }
//                 }],
//                 as: "topics_trueFalse_info"
//             }
//         },
//         {
//             $lookup: {
//                 from: "open_endeds",
//                 localField: "_id",
//                 foreignField: "topicId",
//                 pipeline: [{
//                     $sort: {
//                         sequence: 1
//                     }
//                 }],
//                 as: "topics_openEnded_info"
//             }
//         },
//         {
//             $lookup: {
//                 from: "introductions",
//                 localField: "_id",
//                 foreignField: "topicId",
//                 pipeline: [{
//                     $sort: {
//                         sequence: 1
//                     }
//                 }],
//                 as: "topics_intro_info"
//             }
//         },
//         {
//             $lookup: {
//                 from: "match_pairs",
//                 localField: "_id",
//                 foreignField: "topicId",
//                 pipeline: [{
//                     $sort: {
//                         sequence: 1
//                     }
//                 }],
//                 as: "topics_match_info"
//             }
//         }
//     ])
//         .then((result) => {
//             res.status(200).send(result)

//             console.log(result);
//         })
//         .catch((error) => {
//             console.log(error);
//         });

// }

const getQuestionsByTopicId = function (req, res) {
    console.log('hello')
    Topic.aggregate([
        { $match: { _id: new ObjectId(req.params.id) } },
        {
            $lookup: {
                from: "mcqs",
                localField: "_id",
                foreignField: "topicId",
                as: "topics_mcqs_info"
            },
        },
        {
            $lookup: {
                from: "true_falses",
                localField: "_id",
                foreignField: "topicId",
                as: "topics_trueFalse_info"
            }
        },
        {
            $lookup: {
                from: "open_endeds",
                localField: "_id",
                foreignField: "topicId",
                as: "topics_openEnded_info"
            }
        },
        {
            $lookup: {
                from: "introductions",
                localField: "_id",
                foreignField: "topicId",
                as: "topics_intro_info"
            }
        },
        {
            $lookup: {
                from: "match_pairs",
                localField: "_id",
                foreignField: "topicId",
                as: "topics_match_info"
            }

        },

        {
            '$addFields': {
                'allQuestions': {
                    '$concatArrays': [
                        '$topics_mcqs_info', '$topics_trueFalse_info', '$topics_openEnded_info', '$topics_intro_info', '$topics_match_info'
                    ],

                }
            }
        },
        {
            '$project': {
                'topics_mcqs_info': 0,
                'topics_trueFalse_info': 0,
                'topics_openEnded_info': 0,
                'topics_match_info': 0,
                'topics_intro_info': 0
            }
        }

    ])
        .then((result) => {
            res.status(200).send(result)

            console.log(result);
        })
        .catch((error) => {
            console.log(error);
        });
}

// Update a user  by the id.
async function topicUpdate(req, res) {
    Topic.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, { new: true })
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: `Topic not found with id ${req.params.id}`
                });
            }
            res.send({
                success: true,
                data: data
            });

        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    success: false,
                    message: `Topic not found with id ${req.params.id}`
                });
            }
            return res.status(500).send({
                success: false,
                message: `Error updating Topic with id ${req.params.id}`
            });
        });
};

//Update topic
const updateTopic = async function (req, res) {
    const { topic, language, ageGroup, grade, noOfQuestions, remainingQuestions, access, accessCode, country, time } = req.body;
    try {
        const questions = await Topic.findById(req.params.id)
        if (!questions) {
            return res.status(400).send('Topic not found');
        }
        // if(questions === questions.topic && questions._id) {
        //     return res.status(400).send('topic already exists');
        // }
        let materialPrivacy
        if (req.body.access === false) {
            materialPrivacy = ""
        }
        else {
            materialPrivacy = accessCode
        }
        questions.access = access
        questions.accessCode = materialPrivacy
        questions.topic = topic;
        questions.language = language
        questions.ageGroup = ageGroup
        questions.grade = grade
        questions.noOfQuestions = noOfQuestions
        questions.remainingQuestions = remainingQuestions
        questions.country = country
        questions.time = time

        const updateQuestions = await questions.save()
        return res.json(updateQuestions);

    } catch (err) {
        return res.status(500).send('Something went wrong. Try again ' + err);
    }
};



// Routes
router.post('/create/:userId/:subId/:ageId', createTopics);
// router.get('/', getAllTopics);
router.get('/topicName/:topic', getUnique_topic);
router.get('/name/:topic', getTopicByName)
router.get('/getTopic/:userId/:id', getTopicsById);
router.get('/get/:userId', getTopicByUserId);
router.get('/get/:userId/:subId', getTopicBySubjectId);
router.get('/get/:userId/:subId/:ageId', getTopicByAgeId);
router.delete('/delete/:id', topic_delete);
router.get('/getByTopic/:id', getQuestionsByTopicId);
router.get('/', getTopicDataByQuery)
router.get('/getTopicById/:id', getTopicByTopicId)
router.put('/update/:id', updateTopic);

module.exports = router;