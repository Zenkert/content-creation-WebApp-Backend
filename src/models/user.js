const Joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');

const User = mongoose.model('User', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePictureURL: {
        type: String
    },
    role: {
        type: String,
        default: 'User',
        enum: ["User", "Admin", "SuperAdmin"]
    },

}));

// User.methods.generateAuthToken = function () {
//     const token = jwt.sign(
//         {
//             _id: this.id,
//             name: this.name,
//             userId: this.userId
//         },
//         config.get('jwtPrivateKey')
//     );
//     return token;
// }
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;