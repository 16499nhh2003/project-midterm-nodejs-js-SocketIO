const jwt = require('jsonwebtoken')
require('dotenv')

module.exports = (req, res, next) => {
    let authorization = req.header('Authorization');

    if (!authorization) {
        return res.status(401).json({
            code: 1,
            message: 'Please Provide Header'
        })
    }

    let token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            code: 1,
            message: 'Please provide Token'
        })
    }

    const { JWT_SECRET } = process.env;

    jwt.verify(token, JWT_SECRET, (err, data) => {
        if (err) {
            return res.status(401).json({
                code: 101,
                message: 'Token is invalid or expires time out'
            })
        }
        req.user = data;
        next()
    })
}