var express = require('express');
var router = express.Router();
const Users = require('../models/users.js');
const {check, validationResult, body} = require("express-validator");
var bcrypt = require("bcryptjs");
var fs = require("fs");
const saltRounds = 10;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('auth', { title: 'login | test project' });
});



router.get('/registration', function(req, res, next) {
  res.render('reg', { title: 'login | create new user',error :false });
});

router.get('/recovery', function(req, res, next) {
  res.render('recovery', { title: 'recovery | recovery password' });
});


module.exports = router;
