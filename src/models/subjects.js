const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    // icon: {
    //     type: String, // Iwant to store icon here
    //     required: true,
    // }
});
const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
