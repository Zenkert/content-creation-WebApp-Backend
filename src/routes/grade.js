const express = require('express');
const router = express.Router();
const Grade = require('../models/grade');

//Create a new grade
function CreateGrade(req, res) {

    let grade = new Grade(
        {
            grade: req.body.grade

        }
    );

    // save grade in the database.
    grade.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the grade."
            });
        });
};

// retrieve and return all grade.
function getAllGrades(req, res) {
    Grade.find()
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

//Routes
router.get('/get', getAllGrades);
router.post('/create', CreateGrade);
module.exports = router;