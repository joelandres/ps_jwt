var _ = require('underscore');
var fs = require('fs');
var jwt = require('jwt-simple');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var config = require('./config');
var User = require('../models/User');

var model = {
    verifyUrl: 'http://localhost:3000/auth/verifyEmail?token=',
    title: 'psJwt',
    subTitle: 'Thanks for signing up!',
    body: 'Please verify your email address by clicking the button below'
}

exports.send = function(email, res){
    var payload = {
        sub: email
    };

    var token = jwt.encode(payload, config.EMAIL_SECRET);

    // var transporter = nodemailer.createTransport(smtpTransport({
    //     host: 'smtpout.secureserver.net',
    //     secure: true,
    //     auth: {
    //         user: 'alex@socialplay.com',
    //         pass: config.SMTP_PASS
    //     }
    // }));

    var transporter = nodemailer.createTransport('smtps://joelmandres%40gmail.com:pass@smtp.gmail.com');

    var mailOptions = {
        from: 'Joel Andres <joel.andres@gmail.com',
        to: email,
        subject: 'psJwt Account verification',
        html: getHtml(token)
    }

    transporter.sendMail(mailOptions, function(err, info){
        if (err) return res.status(500, err);

        console.log('email sent ', info.response);
    });
}

exports.handler = function(req, res){
    var token = req.query.token;

    var payload = jwt.decode(token, config.EMAIL_SECRET);

    var email = payload.sub;

    if (!email){
        return handleError(res);
    }

    User.findOne({email:email}, function(err, user){
        if (err) return res.status(500);

        if (!user) return handleError(res);

        if (!user.active){
            user.active = true;
        }

        user.save(function(err){
            if (err) return res.status(500);

            return res.redirect(config.APP_URL);
        })
    });
}

function getHtml(token){
    var path = './views/emailVerification.html';
    var html = fs.readFileSync(path, encoding = 'utf8');

    var template = _.template(html);

    model.verifyUrl += token;

    return template(model);
}

function handleError(res){
    return res.status(401).send({
        message: 'Authenticaion failed, unable to verify email'
    })
}

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
}