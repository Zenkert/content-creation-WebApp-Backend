const jwt = require("jsonwebtoken");  
let jwtSecretKey = process.env.JWT_SECRET_KEY;
// let jwtSecretKey = 'gfg_jwt_secret_key';

function checkAuth (req, res, next) {  
    try{const token = req.headers.authorization  
        .split(" ")[1];  
        jwt.verify(token, jwtSecretKey);  
        next();  

        }catch(error){  
          res.status(401).json({message: "Auth Failed"});  
        }  
};  
module.exports = checkAuth