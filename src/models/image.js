const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String
    }
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     required: true,
    //     ref: "user"
    // }
});
const Image = mongoose.model('Image', imageSchema);
module.exports = Image;