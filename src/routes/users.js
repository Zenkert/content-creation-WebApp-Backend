const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const checkAuth = require('../middleware/check-auth');
const Token = require('../models/forgot_pass_token');
const crypto = require('crypto');
const Joi = require('joi')
const sendEmail = require('../utils/sendEmail');
const forgotPasswordEmail = require('../utils/forgotPasswordEmail');
const role = require('../models/role')
const Topic = require('../models/topic')
const Open_Ended = require('../models/open-ended');
const Mcqs = require('../models/mcqs');
const True_false = require('../models/true_false')
// const config = require('config');
const _ = require('lodash');
// var async = require('async');

// // Create new User
// const createUser = async function (req, res, err) {
//     // Check if this user already exisits.
//      let user = await User.findOne({ email: req.body.email }, async function (err, user) {
//         if (user) {
//             return res.status(400).send('That user already exists!');
//         }
//         // if (err) return res.status(500).send('Error on the server.');

//         else {
//             // Insert the new user if they do not exist yet.
//             user = new User({
//                 name: req.body.name,
//                 email: req.body.email,
//                 password: req.body.password,
//                 role: req.body.role
//             });
//             // Hash the password before saving into database.
//             const salt = await bcrypt.genSalt(10);
//             user.password = await bcrypt.hash(user.password, salt);
//             await user.save(user.email, user.password, user.role || 'basic');

//             // Generating the token for user verification
//             const token = new Token({ userId: user._id, token: crypto.randomBytes(16).toString('hex') });
//             await token.save();

//             // Send varification email
//             const link = `${process.env.CLIENT_URL}/authenticate/verify/${token.token}`;
//             await sendEmail(user.email, "Email Verification", link, user.name);
//             console.log(token)
//             res.status(200).send({
//                 message: "Email Verification link sent to your email",
//             });
//         }
//      });

// };
// Create new User
const createUser = async function (req, res) {
    // Check if this user already exisits.
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('That user already exists!');
    } else {
        // Insert the new user if they do not exist yet.
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || "User"
        });
        // Hash the password before saving into database.
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        // Generating the token for user verification
        const token = new Token({ userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        await token.save();

        // Send varification email
        const link = `${process.env.CLIENT_URL}/authenticate/verify/${token.token}`;
        await sendEmail(user.email, "Email Verification", link, user.name);
        console.log(token)
        res.status(200).send({
            user: user,
            message: "Email Verification link sent to your email",
        });
    }
};


const getUnique_email = function (req, res) {
    User.findOne({ email: req.params.email })
        .then(data => {
            var message = "";
            console.log(data)
            if (data === undefined || data.length == 0 || data == null) message = "No user found!";
            else message = 'user successfully retrieved';
            res.status(200).send(data)
        }).catch(err => {
            res.status(200).send({})
            // res.status(400).send('Some error occured')
        })
}

// Verify Email address Api
const confirmationEmail = function (req, res, next) {

    // Find a matching token
    Token.findOne({ token: req.params.token }, function (err, token) {
        if (!token) return res.status(400).send({
            type: 'not-verified',
            msg: `We were unable to find a valid token.Your token my have expired.`
        });

        // If we found a token, find a matching user
        User.findOne({ _id: token.userId }, function (err, user) {
            if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
            if (user.isVerified) return res.status(400).send({
                type: 'already-verified',
                msg: 'This user has already been verified.'
            });

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send("The account has been verified. Please login.");
            });
        });
    });
};

// Email Verification resend request
const resendTokenPost = function (req, res, next) {

    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please login.' });

        // Create a verification token.
        var token = new Token({ userId: user._id, token: crypto.randomBytes(16).toString('hex') });

        // Save the token
        token.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }

            // Send varification email
            const link = `${process.env.BASE_URL}/users/confirm/${token.token}`;
            sendEmail(user.email, "Email Verification\n", link);
            res.status(200).send({
                message: "Email Verification link sent to your email",
            });
        });

    });
};

// // Authentication API
const getUserByToken = function (req, res) {
    User.findById(req.user._id, { password: 0 }, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");

        res.status(200).send(user);
    });
};

// Login user API
const loginUser = function (req, res) {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        // Compare hashed and user password
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        // Generating JWT token
        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, jwtSecretKey, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ user, token: token, expiresIn: 86400 });
    });
};

// Get User by its ID
function getUserById(req, res) {
    User.findById(req.params.id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: "User not found with id " + req.params.id
                });
            }
            res.send({
                success: true,
                message: 'User successfully retrieved',
                data: data
            });
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    success: false,
                    message: "User not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                success: false,
                message: "Error retrieving User with id " + req.params.id
            });
        });
};

// Get All users array
function getAllUsers(req, res) {
    User.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "No User found!";
            else message = 'Users successfully retrieved';

            res.send({
                success: true,
                message: message,
                data: data
            });
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving Users."
            });
        });
};

// Delete User by its ID
function deleteUser(req, res, next) {
    User.findById(req.params.id)
        .then(user => {
            if (!user) {
                return next(res.status(404).send({
                    success: false,
                    message: "User not found with id " + req.params.id
                }));
            }
            // Topic.remove({ userId: user._id }).exec();
            // Mcqs.remove({ userId: user._id }).exec();
            // Open_Ended.remove({ userId: user._id }).exec();
            // True_false.remove({ userId: user._id }).exec();
            user.remove()
            return res.send({
                success: true,
                message: "User successfully deleted!"
            });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    success: false,
                    message: "User not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                success: false,
                message: "Could not delete product with id " + req.params.id
            });
        });
    // User.findByIdAndRemove(req.params.id)
    //     .then(data => {
    //         if (!data) {
    //             return res.status(404).send({
    //                 success: false,
    //                 message: "User not found with id " + req.params.id
    //             });
    //         }
    //         res.send({
    //             success: true,
    //             message: "User successfully deleted!"
    //         });
    //     }).catch(err => {
    //         if (err.kind === 'ObjectId' || err.name === 'NotFound') {
    //             return res.status(404).send({
    //                 success: false,
    //                 message: "User not found with id " + req.params.id
    //             });
    //         }
    //         return res.status(500).send({
    //             success: false,
    //             message: "Could not delete product with id " + req.params.id
    //         });
    //     });
};

// Update a user  by the id.
async function userUpdate(req, res) {
    // find user and update
    // const pass = req.body.password
    // const salt = await bcrypt.genSalt(10);
    // req.body.password = await bcrypt.hash(pass, salt)
    User.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, { new: true })
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: `User not found with id ${req.params.id}`
                });
            }
            res.send({
                success: true,
                data: data
            });

        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    success: false,
                    message: `User not found with id ${req.params.id}`
                });
            }
            return res.status(500).send({
                success: false,
                message: `Error updating User with id ${req.params.id}`
            });
        });
};

// Change password 
const updatePassword = async (req, res) => {
    const { oldPassword, password } = req.body;

    try {
        // get user
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).send('User not found');
        }
        // validate old password
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).send('Please enter correct old password');
        }
        // hash new password
        const hashedPassword = await bcrypt.hash(password, 12);
        // update user's password
        user.password = hashedPassword;
        const updatedUser = await user.save();
        return res.json({ user: updatedUser });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Something went wrong. Try again' + err);
    }
};

// Forgot password request
const requestPasswordReset = async function (req, res) {
    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("User with given email doesn't exist");

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.CLIENT_URL}/authenticate/resetPassword/${user._id}/${token.token}`;
        await forgotPasswordEmail(user.email, "Password reset", link, user.name);
        console.log(token)
        res.status(200).send({
            success: true,
            message: "Password reset link sent to your email",
            link
        });
        return link;
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
}

// Reseting the password
const resetPassword = async function (req, res) {

    const userId = req.params.userId
    const token = req.params.token
    let passwordResetToken = await Token.findOne({ userId: req.params.userId });
    if (!passwordResetToken) {
        return res.status(404).send({
            type: 'token-expired',
            msg: "Invalid or expired password reset token"
        });
    }
    console.log(token, passwordResetToken)
    const isValid = (token == passwordResetToken.token);
    if (!isValid) {
        return res.status(404).send({
            type: 'token-expired',
            msg: "Invalid or expired password reset token"
        });
    }
    let password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await User.updateOne(
        { _id: userId },
        { $set: { password: hash } },
        { new: true }
    );
    await passwordResetToken.deleteOne();
    return res.send('Password changed');
};

// Reset password get request
const resetPage = async function (req, res) {
    const token = req.params.token
    let passwordResetToken = await Token.findOne({ userId: req.params.userId });
    if (!passwordResetToken) {
        return res.status(404).send({
            type: 'token-expired',
            msg: 'Token not found.'
        });
    }
    const isValid = (token == passwordResetToken.token);
    if (!isValid) {
        return res.status(404).send({
            type: 'token-expired',
            msg: 'Token has been expired.'
        });
    }
    return res.send('Please change your password');
};

// // Signup with google
router.post("/google", async (req, res) => {
    if (!req.body.idToken) {
        return res.status(400).send({ error: "ID Token Required for login" });
    }
    try {
        const decoded = jwt.decode(req.body.idToken);

        console.log(decoded);
        console.log(decoded.email);
        let user = await User.findOne({ email: decoded.email });

        if (!user) {
            //register
            console.log("user not found creating new user");
            user = new User({
                name: decoded.given_name,
                email: decoded.email,
            });
            if (decoded.picture) {
                console.log("addind picture");
                user.picture = decoded.picture;
            }
            console.log(user.JSON);

            await user.save();
            console.log("user saved");
        }
        //login
        let jwtSecretKey = process.env.JWT_SECRET_KEY;

        const token = jwt.sign(
            {
                _id: this.id,
                name: this.name,
                userId: this.userId
            },
            jwtSecretKey
        );
        console.log("token generated" + token);
        let userJson = user.toJSON();
        userJson.token = token;
        return res.status(200).json(_.pick(userJson, ['_id', 'token']));

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal error occured" });
    }
});


//Routes
router.post('/create', createUser);
router.get('/userEmail/:email', getUnique_email);
router.get('/confirm/:token', confirmationEmail);
router.post('/login', loginUser);
router.post('/changePassword/:id', checkAuth, updatePassword)
router.get('/me', verifyToken, getUserByToken);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.patch('/update/:id', checkAuth, userUpdate);
router.delete('/delete/:id', checkAuth, deleteUser);
// Forgot password end points
router.post('/forgot-password', checkAuth, requestPasswordReset);
router.post('/forgot/:userId/:token', checkAuth, resetPassword);
router.post('/resend', resendTokenPost);
router.get('/forgot/:userId/:token', resetPage)

module.exports = router;