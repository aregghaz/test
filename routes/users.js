var express = require('express');
var router = express.Router();


router.get('/home', function (req, res, next) {
    res.render('index', {title: 'Enter code | test project'});
});
router.get('/add-code', function (req, res, next) {
    if(req.user.verified) {
        res.render('index', {title: 'home | test project'});
    }else {
        res.render('code', {title: 'Enter code | test project',code:req.session.code});
    }
});


module.exports = router;
