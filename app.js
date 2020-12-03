var createError = require('http-errors');
var express = require('express');
var session = require('express-session');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var auth_routes = require('./routes/auth');
var app = express();
var passport = require('passport');
require('./middleware/passport')(passport);
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const { ensureAuthenticated, forwardAuthenticated } = require('./middleware/auth');
app.use('/auth', auth_routes);
app.use('/', indexRouter);
app.use('/', ensureAuthenticated, usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// Connection URL
const url = 'mongodb://localhost:27017/project1';

// Database Name
const dbName = 'project1';
mongoose.connect(url, { useNewUrlParser: true })
    .then(() => {

      console.log('database connected!');
    })
    .catch(err => console.log(err));



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
