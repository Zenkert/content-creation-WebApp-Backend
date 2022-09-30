const express = require('express');
const router = express.Router();
const True_false = require('../models/true_false');
const upload = require('../middleware/multer-middleware');
const { uploadFile, getFileStream, deleteFileStream } = require('../utils/s3');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const url = require('url');
const Topic = require('../models/topic');
const updateRemainingQuestions = require('../middleware/updateRemainingQuestions')

//Create a new question
const CreateTFQuestion = async function (req, res) {
    let result, url, fileUrl, imageUrl
    if (req.file) {
        const file = req.file
        result = await uploadFile(file)
        await unlinkFile(file.path) // remove file from the upload folder
        url = req.protocol + '://' + req.get("host");
        fileUrl = '/api/openEnded/getImage/'
        imageUrl = url + fileUrl + result?.Key
    } else {
        imageUrl = ''
    }
    // create a true false
    let true_false = new True_false(
        {
            question: req.body.question,
            answer: req.body.answer,
            sequence: req.body.sequence,
            posFeedback: req.body.posFeedback,
            negFeedback: req.body.negFeedback,
            userId: req.params.userId,
            topicId: req.params.topicId,
            file: imageUrl
        }
    );

    // save True_false in the database.
    true_false.save()
        .then(data => {
            res.send(
                // success: true,
                // message: 'Mcqs successfully created',
                data
            );
            updateRemainingQuestions(req.params.topicId)
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the true false."
            });
        });
};

// retrieve and return all true false.
function allTrueFalse(req, res) {
    console.log("hi")
    True_false.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No True false found!";
            else message = 'True false successfully retrieved';

            res.send({
                success: true,
                message: message,
                data: data
            });
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving True false."
            });
        });
};

// Get true false by topicId and userId
const getTrueFalseByTopic = function (req, res) {
    True_false.find({ userId: req.params.userId, topicId: req.params.topicId })
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No true false found!";
            else message = 'true false successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(400).send('Some error occured')
        })
}

// Delete question
const deleteQuestion = function (req, res, next) {
    True_false.findById(req.params.id)
        .then(question => {
            if (!question) {
                return next(res.status(404).send({
                    success: false,
                    message: "question not found with id " + req.params.id
                }));
            }
            // deleting the images of questions also if it has image
            if (question.file !== '') {
                const url_parts = url.parse(question.file, true);
                const datas = url_parts.pathname.split('getImage/')
                const filekey = datas.pop();
                console.log(filekey);
                deleteFileStream(filekey);
            }
            question.remove()
            console.log(question.topicId, 'topic id')
            Topic.findById(question.topicId).then(topic => {
                console.log(topic.noOfQuestions, "number total")
                topic.noOfQuestions = parseInt(topic.noOfQuestions) - 1
                topic.save()
            }).catch(err => {
                return next(res.status(500).send({
                    success: false,
                    message: "Could not delete question with id " + err
                }));
            });
            return res.send({
                success: true,
                message: "question successfully deleted!"
            });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return next(res.status(404).send({
                    success: false,
                    message: "question not found with id " + req.params.id
                }));
            }
            return next(res.status(500).send({
                success: false,
                message: "Could not delete question with id " + req.params.id
            }));
        });
}

// update a Mcqs  by the id.
const trueFalseUpdate = async function (req, res) {
    const { sequence, question, answer, posFeedback, negFeedback } = req.body;
    try {
        const questions = await True_false.findById(req.params.id)
        if (!questions) {
            return res.status(400).send('Mcqs not found');
        }
        console.log(questions.file)
        let result, urls, fileUrl, imageUrl
        if (req.file) {
            // deleting the images of questions also if it has image
            if (questions.file !== '') {
                const url_parts = url.parse(questions.file, true);
                const datas = url_parts.pathname.split('getImage/')
                const filekey = datas.pop();
                console.log(filekey);
                deleteFileStream(filekey);
            }
            const file = req.file
            result = await uploadFile(file)
            await unlinkFile(file.path) // remove file from the upload folder
            urls = req.protocol + '://' + req.get("host");
            fileUrl = '/api/openEnded/getImage/'
            imageUrl = urls + fileUrl + result?.Key
        } else {
            if (questions.file == req.body.file) {
                imageUrl = questions.file
            }
            else {
                if (questions.file !== "") {
                    const url_parts = url.parse(questions.file, true);
                    const datas = url_parts.pathname.split('getImage/')
                    const filekey = datas.pop();
                    console.log(filekey);
                    deleteFileStream(filekey);
                }
                imageUrl = ""
            }
            // else {
            //     const url_parts = url.parse(questions.file, true);
            //     const datas = url_parts.pathname.split('getImage/')
            //     const filekey = datas.pop();
            //     console.log(filekey);
            //     deleteFileStream(filekey);
            //     imageUrl = ""
            // }
        }
        questions.file = imageUrl;
        questions.sequence = sequence
        questions.question = question
        questions.answer = answer
        questions.posFeedback = posFeedback
        questions.negFeedback = negFeedback
        const updateQuestions = await questions.save()
        return res.json(updateQuestions);

    } catch (err) {
        return res.status(500).send('Something went wrong. Try again ' + err);
    }
};
// get question by Id
const getQuestionById = function (req, res) {
    True_false.findOne({ _id: req.params.id })
        .then(data => {
            if (!data) {
                res.status(404).send('No question found')
            }
            else res.status(200).send(data)
        }).catch(err => {
            res.status(400).send('Some error occured' + err)
        })
}

//Routes
router.get('/', allTrueFalse);
router.get('/get/:userId/:topicId', getTrueFalseByTopic);
router.post('/create/:userId/:topicId', [upload], CreateTFQuestion);
router.get('/getQuestion/:id', getQuestionById);
router.put('/update/:id', [upload], trueFalseUpdate);
router.delete('/delete/:id', deleteQuestion)
// router.get('/getSequence/:userId/:topicId/:sequence', getSequence);

module.exports = router;