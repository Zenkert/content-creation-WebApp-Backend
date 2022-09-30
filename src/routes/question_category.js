const QuestionType = require('../models/question_category');
const express = require('express');
const router = express.Router();


// Create new type
const createType = function (req, res) {
    let type = new QuestionType(
        {
            questionType: req.body.questionType

        }
    );
    // save subject in the database.
    type.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the question type."
            });
        });
}

// Get All topics
const getAllQuestionType = function (req, res) {
    QuestionType.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No question type found!";
            else message = 'Question type successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Question type."
            });
        });
}

// Get subject by Id

const getTypeById = function (req, res) {
    QuestionType.findById(req.params.id)
    .then(data => {
        if (!data) {
            return res.status(404).send({
                success: false,
                message: "Subject not found with id " + req.params.id
            });
        }
        res.send({
            success: true,
            message: 'Subject successfully retrieved',
            data: data
        });
    }).catch(err => {
        if (err.kind === 'ObjectId') {
            return res.status(404).send({
                success: false,
                message: "Subject not found with id " + req.params.id
            });
        }
        return res.status(500).send({
            success: false,
            message: "Error retrieving Subject with id " + req.params.id
        });
    });
}

// Routes
router.post('/create', createType)
router.get('/get', getAllQuestionType)
router.get('/getType/:id', getTypeById)

module.exports = router;