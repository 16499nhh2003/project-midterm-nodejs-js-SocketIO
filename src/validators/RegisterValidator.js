const { check } = require('express-validator')
module.exports = [

    check('email').exists().withMessage('Please enter email!')
        .notEmpty().withMessage('email not empty')
        .isEmail().withMessage('Email is Invalid'),

    check('password').exists().withMessage('Please enter password!')
        .notEmpty().withMessage('password not empty')
        .isLength({ min: 6 }).withMessage('A password least 6 character'),
    check('rePassword')
        .exists().withMessage('Please confirm password!')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }).withMessage('Passwords must match'),
]