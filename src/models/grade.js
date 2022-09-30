const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    grade: {
        type: String,
        required: true
    }
});

const Grade = mongoose.model('Grade', gradeSchema);
module.exports = Grade;
