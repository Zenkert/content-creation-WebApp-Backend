const { Student } = require('../models/student')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const createStudent = async function (req, res) {
    // Check if this user already exisits
    let student = await Student.findOne({ name: req.body.name });
    if (student) {
        return res.status(400).send('That user already exists!');
    } else {
        // Insert the new user if they do not exist yet
        student = new Student({
            name: req.body.name,
            age: req.body.age,
            country: req.body.country,
            language: req.body.language,
            grade: req.body.grade,
            dev_id: req.body.dev_id
        });
        await student.save();
        res.send(student);
    }
};

const loginStudent = function (req, res) {
    // let jwtSecretKey = 'gfg_jwt_secret_key';
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    Student.findOne({ name: req.body.name }, function (err, student) {
        if (err) return res.status(500).send('Error on the serve');
        if (!student) return res.status(404).send('Student not found');

        // Compare the student password with hashed password
        // const passwordIsValid = bcrypt.compareSync(req.body.password, student.password)
        // if (!passwordIsValid) return res.status(401).send({ auth: false, token: null })
        const token = jwt.sign({ id: student._id }, jwtSecretKey, { expiresIn: 86400 });
        // Create jason web token for authentication
        res.status(200).send({ auth: true, token: token });
    })
}

function getAllUsers(req, res) {
    Student.find()
        .then(data => { 
            var message = "";
            if (data === undefined || data.length == 0) message = "No User found!";
            else message = 'Users successfully retrieved';

            res.send({
                success: true,
                message: message,
                data: data
            });
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Users."
            });
        });
};

function getUserByName(req, res) {
    Student.findOne({name: req.params.name})
        .then(data => { 
            var message = "";
            if (data === undefined || data.length == 0) message = "No User found!";
            else message = 'Users successfully retrieved';

            res.send({
                success: true,
                message: message,
                data: data
            });
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Users."
            });
        });
};

//Routes
router.post('/login', loginStudent);
router.post('/create', createStudent);
router.get('/', getAllUsers);
router.get('/getUser/:name', getUserByName);

module.exports = router;
