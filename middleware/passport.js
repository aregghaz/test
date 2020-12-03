const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Users = require('../models/users.js');
// Load User model

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            Users.findOne({
              email:email
            }).then(user => {
                if (!user) {
                    return done(null, false, { email: 'Этот адрес электронной почты не зарегистрирован или неправильный пароль' });
                }
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { password: 'Неверный пароль' });
                    }
                });
            });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });


    passport.deserializeUser(function(id, done) {
        Users.findOne({
            _id:id
        }).then((res)=>{
            if(res == null) var err = "Not Found";
            else var err = "";
            done(err,res);
        });


    });
};