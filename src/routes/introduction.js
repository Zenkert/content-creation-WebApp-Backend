const express = require('express');
const router = express.Router();
const Introduction = require('../models/introduction')
const upload = require('../middleware/multer-middleware');
const { uploadFile, getFileStream, deleteFileStream } = require('../utils/s3');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const url = require('url');
const Topic = require('../models/topic');
const updateRemainingQuestions = require('../middleware/updateRemainingQuestions')

//Create a new introduction
const CreateIntroduction = async function (req, res) {
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

    let introduction = new Introduction(
        {
            introduction: req.body.introduction,
            sequence: req.body.sequence,
            userId: req.params.userId,
            topicId: req.params.topicId,
            link: req.body.link,
            file: imageUrl
        }
    );

    // save introduction in the database.
    introduction.save()
        .then(data => {
            res.send(data);
            updateRemainingQuestions(req.params.topicId)
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the introduction."
            });
        });
};

// find a single introduction with a id.
function intro_details(req, res) {
    Introduction.findById(req.params.id)
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

//Update question
const updateQuestion = async function (req, res) {
    const { sequence, introduction, link } = req.body;
    try {
        const questions = await Introduction.findById(req.params.id)
        if (!questions) {
            return res.status(400).send('Open ended not found');
        }
        let result, urls, fileUrl, imageUrl
        //if(req.file == questions.file) console.log("same file")
        if (req.file) {
            console.log("inside if")
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
        questions.introduction = introduction
        questions.link = link
        const updateQuestions = await questions.save()
        return res.json(updateQuestions);

    } catch (err) {
        return res.status(500).send('Something went wrong. Try again ' + err);
    }
};


// Delete question
const deleteIntro = function (req, res, next) {
    Introduction.findById(req.params.id)
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

// // retrieve and return all introduction.
// function allIntroduction(req, res) {
//     Introduction.find()
//         .then(data => {
//             var message = "";
//             if (data === undefined || data.length == 0) message = "No question found!";
//             else message = 'question successfully retrieved';

//             res.send(data);
//         }).catch(err => {
//             res.status(500).send({
//                 success: false,
//                 message: err.message || "Some error occurred while retrieving question."
//             });
//         });
// };

// // Get question by topic
// const getQuestionByTopic = function (req, res) {
//     Open_Ended.find({ userId: req.params.userId, topicId: req.params.topicId})
//         .then(data => {
//             var message = "";
//             if (data === undefined || data.length == 0) message = "No question found!";
//             else message = 'question successfully retrieved';
//             res.status(200).send(data)
//         }).catch(err => {
//             res.status(400).send('Some error occured')
//         })
// }

//Routes
// router.get('/', allquestions);
router.post('/create/:userId/:topicId',[upload], CreateIntroduction);
router.get('/getQuestion/:id', intro_details);
router.put('/update/:id',[upload], updateQuestion);
router.delete('/delete/:id', deleteIntro);

// router.get('/get/:userId/:topicId', getQuestionByTopic);
module.exports = router;