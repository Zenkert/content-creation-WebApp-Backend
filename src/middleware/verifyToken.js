var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
let jwtSecretKey = process.env.JWT_SECRET_KEY;

function verifyToken(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, jwtSecretKey, function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        // if everything good, save to request for use in other routes
        req.user = {

        }
        req.user._id = decoded.id;
        next();
    });
}
module.exports = verifyToken;
