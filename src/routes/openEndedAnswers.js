const express = require('express');
const router = express.Router();
const OpenEndedAnswer = require('../models/openEndedAnswers');

function isValidAnswerRequest(req) {
    if (!req.body.answer || !req.body.timeStamp || !req.body.userId || !req.body.questionId || !req.body.username) {
        return false;
    }
    return true;
}
//Create a new grade
function CreateAnswer(req, res) {
  // validate request
  if(!isValidAnswerRequest(req)) {
    return res.status(400).send({
        success: false,
        message: "Please fill out all the required feilds"
    });
}
    let answer = new OpenEndedAnswer(
        {
            answer: req.body.answer,
            userId: req.body.userId,
            timeStamp: req.body.timeStamp,
            questionId: req.body.questionId,
            username: req.body.username
        }
    );

    // save grade in the database.
    answer.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while saving the answer."
            });
        });
};

// retrieve and return all grade.
function getAllAnswers(req, res) {
    OpenEndedAnswer.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No grade found!";
            else message = 'grade successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving grade."
            });
        });
};

function getAnswerById(req, res) {
    OpenEndedAnswer.find({ questionId: req.params.questionId })
        .then(data => {
            var message = "";
            if (!data) message = "No Answer found!";
            else message = 'Answers successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Answers."
            });
        });
};

//Routes
router.get('/get', getAllAnswers);
router.post('/create', CreateAnswer);
router.get('/getAnswer/:questionId', getAnswerById);
module.exports = router;