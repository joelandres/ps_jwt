var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var moment = require('moment');
var facebookAuth = require('./services/facebookAuth');
var googleAuth = require('./services/googleAuth');
var localStrategy = require('./services/localStrategy');
var jobs = require('./services/jobs');
var emailVerification = require('./services/emailVerification');
var createSendToken = require('./services/jwt');

var app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

passport.serializeUser(function(user, done){
    done(null, user.id);
});

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

passport.use('local-register', localStrategy.register);
passport.use('local-login', localStrategy.login);

app.post('/register', passport.authenticate('local-register'), function(req, res){
    emailVerification.send(req.user.email, res);
    createSendToken(req.user, res);
});

app.post('/login', passport.authenticate('local-login'), function(req, res){
    createSendToken(req.user, res);
});

app.get('/auth/verifyEmail', emailVerification.handler);

app.post('/auth/facebook', facebookAuth);

app.post('/auth/google', googleAuth)

app.get('/jobs', jobs);

mongoose.connect('mongodb://localhost/psjwt');

var server = app.listen(3000, function(){
    console.log('api listening on ', server.address().port);
});