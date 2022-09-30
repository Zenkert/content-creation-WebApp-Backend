const Topic = require('../models/topic');

function updateRemainingQuestions(topicId) {
    Topic.findById(topicId).then(topic => {
        console.log(topic.noOfQuestions, "number total")
        topic.remainingQuestions = topic.remainingQuestions - 1
        topic.save()
    }).catch(err => {
        return res.status(500).send({
            success: false,
            message: "Something went wrong " + err
        });
    });
}
module.exports = updateRemainingQuestions