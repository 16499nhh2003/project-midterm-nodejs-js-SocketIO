const express = require('express')
const Router = express.Router();

const RegisterValidator = require('../validators/RegisterValidator')
const LoginValidator = require('../validators/LoginValidator')

const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

require('dotenv')


const Account = require('../models/Account');
const Verify = require('../auth/Verify');

Router.post('/login', LoginValidator, (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0) {
        let { email, password } = req.body;
        let account = undefined;

        Account
            .findOne({ email: email })
            .then(acc => {
                if (!acc) {
                    throw new Error('Email khong hop le')
                }
                account = acc;

                return bcrypt.compare(password, acc.password)
            })
            .then(passwordMatch => {
                if (!passwordMatch) {
                    return res.status(401).json({
                        code: 1,
                        message: 'Login Fail'
                    })
                }
                const { JWT_SECRET } = process.env

                jwt.sign({
                    email: account.email
                }, JWT_SECRET,
                    function (err, token) {
                        if (err) {
                            throw new err;
                        }

                        req.session.token = token;
                        req.session.account = account;

                        return res.status(200).json({
                            code: 1,
                            status: true,
                            message: 'Login Successfully',
                            token: token,
                        })
                    })

            })
            .catch(e => {
                return res.status(401).json({
                    code: 1,
                    message: e.message
                })
            })
    }
    else {
        result = result.mapped();
        let msg = ''
        for (fields in result) {
            msg = result[fields].msg;
            break;
        };
        return res.json({
            code: 1,
            message: msg
        })
    }
});
Router.post("/register", RegisterValidator, (req, res) => {
    let result = validationResult(req);

    if (result.errors.length === 0) {
        let { email, password, fullName } = req.body;
        console.log(email)

        Account.findOne({ email: email })
            .then(acc => {
                if (acc) {
                    throw new Error('Account Exist?');
                }
            })
            .then(() => bcrypt.hash(password, 10))
            .then(hashed => {
                let user = new Account({
                    email,
                    password: hashed,
                    fullName: fullName
                });

                user.save()
                    .then(() => {
                        return res.status(201).json({
                            code: 1,
                            message: 'Register Account Successfully'
                        });
                    })
                    .catch(e => {
                        return res.status(500).json({
                            code: 0,
                            message: 'Register Account Fail. Error: ' + e.message
                        });
                    });
            })
            .catch(e => {
                return res.status(400).json({
                    code: 0,
                    message: e.message
                });
            });
    } else {
        result = result.mapped();
        let msg = '';
        for (fields in result) {
            msg = result[fields].msg;
            break;
        }
        return res.status(400).json({
            code: 1,
            message: msg
        });
    }
});

Router.get('/allusers/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const accounts = await Account
            .find({ _id: { $ne: id } })
            .select([
                "fullName",
                "email",
                "_id"
            ]);

        return res.status(200).json({
            code: 1,
            status: true,
            message: "Successfully",
            data: accounts,
        })

    } catch (error) {
        next(error)
    }
})

Router.get('/', Verify, (req, res) => {
    const account = req.session.account;
    //console.log(account)

    if (account) {
        delete account.password
        res.status(200)
            .json({
                code: 1,
                status: true,
                account: account
            })
    } else {
        res.status(401)
            .json({
                code: 1,
                status: false,
                error: 'Unauthorized'
            });
    }

});

Router.get('/getallusers/:id', async (req, res, next) => {
    try {
        const users = await Account
            .find({ _id: { $ne: req.params.id } })
            .select(["fullName", "email", "_id"])

        return res.status(200).json({
            code: 1,
            status: true,
            data: users,
        })

    } catch (error) {
        next(error)
    }
})

Router.post('/logout', (req, res) => {
    // Clear the session data
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                code: 1,
                message: 'Logout failed'
            });
        }
        res.status(200).json({
            code: 1,
            status: true,
            message: 'Logout successful'
        });
    });
});

module.exports = Router