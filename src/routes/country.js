const express = require('express');
const router = express.Router();
const Country = require('../models/country');

//Create a new country
function CreateCountry(req, res) {

    let country = new Country(
        {
            country: req.body.country

        }
    );

    // save country in the database.
    country.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the Country."
            });
        });
};

// retrieve and return all country.
function getAllCountry(req, res) {
    Country.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No country found!";
            else message = 'country successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving country."
            });
        });
};

//Routes
router.get('/get', getAllCountry);
router.post('/create', CreateCountry);
module.exports = router;