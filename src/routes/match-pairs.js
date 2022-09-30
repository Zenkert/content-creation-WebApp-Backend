const express = require('express');
const router = express.Router();
const Match_Pairs = require('../models/match-pairs');
const upload = require('../middleware/multer-middleware');
const { uploadFile, getFileStream, deleteFileStream } = require('../utils/s3');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const url = require('url');
const Topic = require('../models/topic');
const updateRemainingQuestions = require('../middleware/updateRemainingQuestions')

//Create a new question
const CreateMatchPairs = async function (req, res) {
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
    let match_pairs = new Match_Pairs(
        {
            question: req.body.question,
            statement1: req.body.statement1,
            answer1: req.body.answer1,
            statement2: req.body.statement2,
            answer2: req.body.answer2,
            statement3: req.body.statement3,
            answer3: req.body.answer3,
            statement4: req.body.statement4,
            answer4: req.body.answer4,
            statement5: req.body.statement5,
            answer5: req.body.answer5,
            statement6: req.body.statement6,
            answer6: req.body.answer6,
            // statement7: req.body.statement7,
            // answer7: req.body.answer7,
            // statement8: req.body.statement8,
            // answer8: req.body.answer8,
            sequence: req.body.sequence,
            posFeedback: req.body.posFeedback,
            negFeedback: req.body.negFeedback,
            userId: req.params.userId,
            topicId: req.params.topicId,
            file: imageUrl
        }
    );
    // save activity in the database.
    match_pairs.save()
        .then(data => {
            res.status(200).send(data);
            updateRemainingQuestions(req.params.topicId)
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the activity."
            });
        });
};



// get question by Id
const getQuestionById = function (req, res) {
    Match_Pairs.findOne({ _id: req.params.id })
        .then(data => {
            if (!data) {
                res.status(404).send('No question found')
            }
            else res.status(200).send(data)
        }).catch(err => {
            res.status(400).send('Some error occured' + err)
        })
}


//Update question
const updateQuestion = async function (req, res) {
    const { sequence, question, statement1, statement2, statement3, statement6, posFeedback, negFeedback,
        statement4, statement5, answer1, answer2, answer3, answer4, answer5, answer6 } = req.body;
    try {
        const questions = await Match_Pairs.findById(req.params.id)
        if (!questions) {
            return res.status(400).send('Question not found');
        }
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
        }
        else {
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
        }
        questions.file = imageUrl;
        questions.sequence = sequence
        questions.question = question
        questions.statement1 = statement1
        questions.statement2 = statement2
        questions.statement3 = statement3
        questions.statement4 = statement4
        questions.statement5 = statement5
        questions.statement6 = statement6
        // questions.statement7 = statement7
        // questions.statement8 = statement8
        questions.answer1 = answer1
        questions.answer2 = answer2
        questions.answer3 = answer3
        questions.answer4 = answer4
        questions.answer5 = answer5
        questions.answer6 = answer6
        questions.posFeedback = posFeedback
        questions.negFeedback = negFeedback
        // questions.answer7 = answer7
        // questions.answer8 = answer8

        const updateQuestions = await questions.save()
        return res.json(updateQuestions);

    } catch (err) {
        return res.status(500).send('Something went wrong. Try again ' + err);
    }
};

// Delete question
const deleteQuestion = function (req, res, next) {
    Match_Pairs.findById(req.params.id)
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
                return next (res.status(500).send({
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
                return next (res.status(404).send({
                    success: false,
                    message: "question not found with id " + req.params.id
                }));
            }
            return next (res.status(500).send({
                success: false,
                message: "Could not delete question with id " + req.params.id
            }));
        });
}


//Routes
router.post('/create/:userId/:topicId', [upload], CreateMatchPairs);
router.get('/getQuestion/:id', getQuestionById);
router.put('/update/:id', [upload], updateQuestion);
router.delete('/delete/:id', deleteQuestion)
module.exports = router;