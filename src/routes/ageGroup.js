const express = require('express');
const router = express.Router();
const AgeGroup = require('../models/ageGroup');

//Create a new AgeGroup
function CreateAgeGroup(req, res) {

    let age = new AgeGroup(
        {
            age: req.body.age,
            // userId: req.params.userId,
            // topicId: req.params.topicId,

        }
    );

    // save AgeGroup in the database.
    age.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the AgeGroup."
            });
        });
};

// retrieve and return all AgeGroup.
function allAgeGroup(req, res) {
    AgeGroup.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No age found!";
            else message = 'age successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving age."
            });
        });
};

//Routes
router.get('/get', allAgeGroup);
router.post('/create', CreateAgeGroup);
module.exports = router;