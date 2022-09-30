const express = require('express');
const router = express.Router();
const Language = require('../models/language');

//Create a new Language
function CreateLanguage(req, res) {

    let language = new Language(
        {
            language: req.body.language
        }
    );

    // save language in the database.
    language.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the language."
            });
        });
};

// retrieve and return all language.
function allLanguage(req, res) {
    Language.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No language found!";
            else message = 'language successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving language."
            });
        });
};

// // delete a mcqs with the specified id.
// function mcqs_delete(req, res) {
//     Mcqs.findByIdAndRemove(req.params.id)
//         .then(data => {
//             if (!data) {
//                 return res.status(404).send({
//                     success: false,
//                     message: "Mcqs not found with id " + req.params.id
//                 });
//             }
//             res.send({
//                 success: true,
//                 message: "Mcqs successfully deleted!"
//             });
//         })
// };

// // find a single mcqs with a id.
// function mcqs_details(req, res) {
//     Mcqs.findById(req.params.id)
//         .then(data => {
//             if (!data) {
//                 return res.status(404).send({
//                     success: false,
//                     message: "Mcqs not found with id " + req.params.id
//                 });
//             }
//             res.send(data);
//         })
// };

// // update a Mcqs  by the id.
// function mcqs_update(req, res) {
//     // validate request
//     if (!req.body.question || !req.body.options) {
//         return res.status(400).send({
//             success: false,
//             message: "Please enter All details"
//         });
//     }

//     // find Mcqs and update
//     Mcqs.findByIdAndUpdate(req.params.id, {
//         $set: req.body
//     }, { new: true })
//         .then(data => {
//             if (!data) {
//                 return res.status(404).send({
//                     success: false,
//                     message: "Mcqs not found with id " + req.params.id
//                 });
//             }
//             res.send({
//                 success: true,
//                 data: data
//             });
//         }).catch(err => {
//             if (err.kind === 'ObjectId') {
//                 return res.status(404).send({
//                     success: false,
//                     message: "Mcqs not found with id " + req.params.id
//                 });
//             }
//             return res.status(500).send({
//                 success: false,
//                 message: "Error updating Mcqs with id " + req.params.id
//             });
//         });
// };

// function getImage(req, res) {
//     try {

//         let url_parts = url.parse(req.url, true);
//         console.log (url.parse(req.url))
//         let query = url_parts.query;
//         const path =`uploads/mcqs/${query.picture}`;
//         console.log(query.picture)
//         // const path = 'uploads/mcqs/2022/db.png';

//         fs.readFile(path, function (err, data) {
//             if (err) throw err; // Fail if the file can't be read.
//             res.writeHead(200);
//             res.status(200).end(data); // Send the file data to the browser.
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

//Routes
router.get('/get', allLanguage);
router.post('/create', CreateLanguage);
// router.get('/getMcqs/:userId/:topicId/:typeId', getMcqsByTopic)
// router.get('/image', getImage)
// router.get('/:id', mcqs_details);
// router.put('/update/:id', mcqs_update);
// router.delete('/delete/:id', mcqs_delete);
module.exports = router;