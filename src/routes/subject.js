const Subject = require('../models/subjects');
const express = require('express');
const router = express.Router();
// const topicUtils = require('../utils/search');
// const subjectUtils = require('../utils/search')

// Create new topic
const createSubject = function (req, res) {
    let subject = new Subject(
        {
            subject: req.body.subject,
            // icon: req.body.icon

        }
    );
    // save subject in the database.
    subject.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the subject."
            });
        });
}

// Get All topics
const getAllSubjects = function (req, res) {
    Subject.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No Subject found!";
            else message = 'Subject successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Subject."
            });
        });
}

// Get subject by Id

const geySubjectById = function (req, res) {
    Subject.findById(req.params.id)
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
router.post('/create', createSubject)
router.get('/get', getAllSubjects)
router.get('/getSub/:id', geySubjectById)

module.exports = router;