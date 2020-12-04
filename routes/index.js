var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('auth', { title: 'login | test project' });
});
/* GET registration page. */
router.get('/registration', function(req, res, next) {
  res.render('reg', { title: 'login | create new user',error :false });
});
/* GET recovery page. */
router.get('/recovery', function(req, res, next) {
  res.render('recovery', { title: 'recovery | recovery password' });
});

module.exports = router;
