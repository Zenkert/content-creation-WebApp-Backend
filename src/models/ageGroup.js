const mongoose = require('mongoose');

const ageGroupSchema = new mongoose.Schema({
    age: {
        type: String,
        required: true
    }
});

const AgeGroup = mongoose.model('AgeGroup', ageGroupSchema);
module.exports = AgeGroup;
