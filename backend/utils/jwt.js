const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, "ssafy")
        console.log(req.decoded);
        return next();
    } catch (err) {
        return res.json(err);
    }   
}

module.exports = {verifyToken}