const express = require('express');
const students = require('../routes/student');
const users = require('../routes/users');
const mcqsRoute = require('../routes/mcqs');
const tfRoute = require('../routes/true_false');
const topicRoute = require('../routes/topic');
const subjectRoutes = require('../routes/subject');
const imageRoute = require('../routes/image');
const questionTypeRoute = require('../routes/question_category');
const ageGroupRoute = require('../routes/ageGroup');
const languageRoute = require('../routes/language');
const countryRoute = require('../routes/country');
const gradeRoute = require('../routes/grade');
const openEnded = require('../routes/open-ended');
const introduction = require('../routes/introduction');
const match_pairs = require('../routes/match-pairs');
const openEndedAnswers = require('../routes/openEndedAnswers')
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
module.exports = function (app) {
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/mcqs', mcqsRoute);
    app.use('/api/true_false', tfRoute);
    app.use('/api/students', students);
    app.use('/api/topic', topicRoute);
    app.use('/api/subject', subjectRoutes);
    app.use('/api/image', imageRoute);
    app.use('/api/type', questionTypeRoute);
    app.use('/api/age', ageGroupRoute);
    app.use('/api/language', languageRoute);
    app.use('/api/country', countryRoute);
    app.use('/api/grade', gradeRoute);
    app.use('/api/openEnded', openEnded);
    app.use('/api/intro', introduction);
    app.use('/api/match', match_pairs);
    app.use('/api/openAnswer', openEndedAnswers);
    app.use('/uploads', express.static('uploads'));
    // app.use("/uploads", express.static(__dirname + '/uploads'));
    // app.use("/mcqs", express.static(path.join("uploads/mcqs")));  
    app.use(function (req, res, next) {
        res.status(404).send("Sorry can not find that API!")
    });

}