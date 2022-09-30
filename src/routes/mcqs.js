const express = require('express');
const router = express.Router();
const Mcqs = require('../models/mcqs');
const upload = require('../middleware/multer-middleware');
const uploadMultiple = require('../middleware/multer-multiple-uploads');
const { uploadFile, getFileStream, deleteFileStream } = require('../utils/s3');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const url = require('url');
const Topic = require('../models/topic');
const updateRemainingQuestions = require('../middleware/updateRemainingQuestions')

//Create a new question
const CreateQuestion = async function (req, res) {
    // let imagesPaths = [];
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
    // const url = req.protocol + '://' + req.get("host");
    // const fileUrl = req.file.path.replace(/\\/g, '/');

    // if (req.files) {
    //     imagesPaths = req.files.map(element => {
    //         return `${url}/${element.path.replace(/\\/g, '/')}`;
    //     });
    // }
    // else imagesPaths.push(`${url}/${req.file.path.replace(/\\/g, '/')}`)

    let mcqs = new Mcqs(
        {
            mcqs: req.body.mcqs,
            option1: req.body.option1,
            option2: req.body.option2,
            option3: req.body.option3,
            option4: req.body.option4,
            // file: imagesPaths,
            // file: url + "/" + fileUrl,
            file: imageUrl,
            sequence: req.body.sequence,
            posFeedback: req.body.posFeedback,
            negFeedback: req.body.negFeedback,
            answer: req.body.answer,
            userId: req.params.userId,
            topicId: req.params.topicId,
        }
    );
    // save mcqs in the database.
    mcqs.save()
        .then(data => {
            res.send(data);
            updateRemainingQuestions(req.params.topicId)
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the mcqs."
            });
        });
};

// Get mcqs by topic
const getMcqsByTopic = function (req, res) {
    Mcqs.find({ userId: req.params.userId, topicId: req.params.topicId })
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No mcqs found!";
            else message = 'mcqs successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(400).send('Some error occured')
        })
}

// retrieve and return all mcqs.
function allMcqs_questions(req, res) {
    Mcqs.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No Mcqs found!";
            else message = 'Mcqs successfully retrieved';

            res.send(data);
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Mcqs."
            });
        });
};

// Delete question
const deleteQuestion = function (req, res, next) {
    Mcqs.findById(req.params.id)
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
// find a single mcqs with a id.
function mcqs_details(req, res) {
    Mcqs.findById(req.params.id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: "Mcqs not found with id " + req.params.id
                });
            }
            res.send(data);
        })
};

// update a Mcqs  by the id.
const mcqs_update = async function (req, res) {
    const { sequence, mcqs, option1, option2, option3, option4, answer, posFeedback, negFeedback } = req.body;
    try {
        const questions = await Mcqs.findById(req.params.id)
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
        questions.mcqs = mcqs
        questions.option1 = option1
        questions.option2 = option2
        questions.option3 = option3
        questions.option4 = option4
        questions.answer = answer
        questions.posFeedback = posFeedback
        questions.negFeedback = negFeedback
        const updateQuestions = await questions.save()
        return res.json(updateQuestions);

    } catch (err) {
        return res.status(500).send('Something went wrong. Try again ' + err);
    }
};
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

function getImage(req, res) {
    try {

        let url_parts = url.parse(req.url, true);
        console.log(url.parse(req.url) + " naila")
        let query = url_parts.query;
        // console.log(query + " i am query")
        const path = `uploads/mcqs/${query.image}`;
        console.log(query.image + " hello")

        fs.readFile(path, function (err, data) {
            if (err) throw err; // Fail if the file can't be read.
            res.writeHead(200);
            res.status(200).end(data); // Send the file data to the browser.
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//Routes
router.get('/', allMcqs_questions);
// router.post('/create/:userId/:topicId', [uploadMultiple], CreateQuestion);
router.post('/create/:userId/:topicId', [upload], CreateQuestion);
// router.post('/create/:userId/:topicId', CreateQuestion);
router.get('/get/:userId/:topicId', getMcqsByTopic)
router.get('/getQuestion/:id', mcqs_details);
router.put('/update/:id', [upload], mcqs_update);
router.delete('/delete/:id', deleteQuestion)

router.get('/image', getImage);

module.exports = router;


// //Create a new question
// function CreateQuestion(req, res) {
//     let mcqs = new Mcqs(
//         {
//             mcqs: req.body.mcqs,
//             option1: req.body.option1,
//             option2: req.body.option2,
//             option3: req.body.option3,
//             option4: req.body.option4,
//             posFeedback: req.body.posFeedback,
//             negFeedback: req.body.negFeedback,
//             answer: req.body.answer,
//             sequence: req.body.sequence,
//             userId: req.params.userId,
//             topicId: req.params.topicId
//         }
//     );

//     // save mcqs in the database.
//     mcqs.save()
//         .then(data => {
//             res.send(data);
//         }).catch(err => {
//             res.status(500).send({
//                 success: false,
//                 message: err.message || "Some error occurred while creating the mcqs."
//             });
//         });
// };