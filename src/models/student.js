const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    age: {
        type: String,
        required: true
        
    },
    country: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true

    },
    grade: {
        type: String,
        required: true
    },
    dev_id: {
        type: String,
        required: true
    }
});
const Student = mongoose.model('Student', studentSchema);
exports.Student = Student;
