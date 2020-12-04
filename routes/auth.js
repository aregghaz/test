const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Users = require('../models/users.js');
const {check, validationResult, body} = require("express-validator");
var fs = require("fs");
const saltRounds = 10;

// Load User model
//const models = require('./../models');

const {response} = require('express');


router.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


router.post('/auth-login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        console.log(info)
        if (!user) {
            return res.render('auth', {
                auth: true,
                email: req.body.email,
                errors: JSON.stringify(info)
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            if (user.verified) {
                return res.redirect('/home')
            } else {
                return res.redirect('/add-code')
            }

        });

    })(req, res, next);
});


// Logout
router.get('/logout', (req, res) => {
    try {
        req.logout();
        res.redirect('/login');
    } catch (e) {
        res.redirect('/login');
    }
});


router.post("/add-user", [
        check("password", "Поле пароля должно содержать более 6 символов и менее 40").isLength({
            min: 6, max: 40
        }),
        check("phone", "Поле телефона должно содержать более 9 символов.").isLength({
            min: 9,
        }).custom((value) => {
            return checkPhone(value).then((response) => {
                console.log(response)
                if (response) {
                    return Promise.reject("телефон уже существует");
                }
            });
        })
            .exists(),
        check("name", "Поле фамилия, имя должно содержать более 4 символов.").isLength({
            min: 4,
        }),
        check("confirm_password", "Пароли не соответствуют").custom(
            (value, {req}) => value === req.body.password
        ),
        check("email", "Поле электронной почты обязательно для заполнения")
            .not()
            .isEmpty()
            .isEmail()
            .withMessage('Введите правильный формат электронной почты')
            .custom((value) => {
                return checkEmail(value).then((response) => {
                    if (response.length > 0) {
                        return Promise.reject("Электронная почта уже существует");
                    }
                });
            })
            .exists(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array())
            return res.render('reg', {
                'error': JSON.stringify(errors.array()),
                email: req.body.email,
                phone: req.body.phone,
                name: req.body.name,
            })
        }

        /// generate code for mobile
        var randomNumber = Math.floor(Math.random() * 100000);
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            var data = {};
            data = {
                name: req.body.name,
                password: hash,
                email: req.body.email,
                phone: req.body.phone,
                code: randomNumber
            };
            Users.create(data).then((response) => {
                req.session.email = req.body.email
                req.session.code = randomNumber
                res.render('code', {code: randomNumber})
            });
        });
    }
);

/// checking User
function checkEmail(value) {
    return Users.find({
        email: value,
    });
}


router.post('/check-code', [
        check("code", "код из смс должно содержать более 5 символов ").isLength({
            min: 5
        }).isNumeric().withMessage('код должен быть только числом').custom((value) => {
            return checkCode(value).then((response) => {

                if (!response) {
                    return Promise.reject("не прашилний код ");
                }
            });
        })
            .notEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('code', {'error': JSON.stringify(errors.array())})
        }
        Users.findOneAndUpdate({
            email: req.session.email
        }, {verified: 1}, {upsert: false, new: false}).then(response => {
            res.send('ok')
        })
    });

router.post('/password-check-code', [
        check("code", "код из смс должно содержать более 5 символов ").isLength({
            min: 5
        }).isNumeric().withMessage('код должен быть только числом').custom((value) => {
            return checkCode(value).then((response) => {
                if (!response) {
                    return Promise.reject("не прашилний код ");
                }
            });
        })
            .notEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('recovery-password', {
                title: 'Enter code | test project',
                error: JSON.stringify(errors.array()),
                email: JSON.stringify(false)
            })
        }
        Users.findOneAndUpdate({
            email: req.session.email,
        }, {verified: 1}, {upsert: false, new: false}).then(response => {
            res.render('recovery-password', {
                title: 'Enter code | test project',
                code: req.session.code,
                email: JSON.stringify(response.email),
                error: JSON.stringify(false),
            });
        })

    });
/// generate random 6 digit number
function random(min, max) {
    return min + Math.random() * (max - min);
}
router.post('/recovery-password', [
        check("phone", "Поле телефона должно содержать более 9 символов.")
            .custom((value) => {
                return checkPhone(value).then((response) => {
                    console.log(!response)
                    if (!response) {
                        return Promise.reject("Номер телефона не существует");
                    }
                });
            })
            .notEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('recovery', {'error': JSON.stringify(errors.array())})
        }
        var randomNumber = random(100000, 900000).toFixed(0);


        Users.findOneAndUpdate({
            phone: req.body.phone
        }, {verified: 0, code: randomNumber}).then(response => {
            req.session.email = response.email
            req.session.code = randomNumber
            res.render('recovery-password', {
                title: 'Enter code | test project',
                code: req.session.code,
            });
        })
    });
// checking phone number
function checkPhone(value) {

    return Users.findOne({
        phone: value,
    });
}

///checking code
function checkCode(value) {
    return Users.findOne({
        code: value,
    });
}

module.exports = router;
