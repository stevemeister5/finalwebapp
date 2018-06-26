var express = require('express');
var router = express.Router();
var User = require('../models/user');
var path = require('path');
var google = require('google');
const bodyParser = require('body-parser');
var scraper = require('google-search-scraper');
var DeathByCaptcha = require('deathbycaptcha');


//GET route for reading data

router.get('/', function(req, res, next) {
    return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});

//POST route for updating data
router.post('/', function (req, res, next) {
    //confirm that the passwords match
    if(req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match');
        err.status = 400;
        res.send("passwords do not match");
        return next(err);
    }

    if (req.body.email && req.body.username &&
        req.body.password && req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf
        }

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/home');
            }
        });

        } else if (req.body.logemail && req.body.logpassword) {
            User.authenticate(req.body.logemail, req.body.logpassword, function(error, user) {
                if (error || !user) {
                    var err = new Error('Wrong email or password.');
                    err.status = 401;
                    return next(err);
                } else {
                    req.session.userId = user._id;
                    return res.redirect('/home'); //redirect to other page
                }
            });
        } else {
            var err = new Error('All fields required.');
            err.status = 400;
            return next(err);
        }
})

router.get('/home', function(req, res, next) {
    res.render('index', {link: null, href: null, description: null });
})

router.post('/home', function(req, res, next) {//basic mockup to see whether it will load must replace with real deal
        
        
        var dbc = new DeathByCaptcha('username', 'password');

        var options = {
            query: req.body.query,
            limit: 1,
        };

        scraper.search(options, function(err, url, meta) {
            if (err) throw err;
            res.render('query', {title: 'Queries found', link: meta.meta, href: url, description: meta.desc });
        }) 
})


//change this toonly happen at the press of a button
//create a neq router api a get one to render the initial push and a post one to handle data and push data back

//GET route after registering
router.get('/profile', function(req, res, next) {
    User.findByID(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized!!!Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    return res.send('<h1>NAME: </h1>' + user.username + '<h2>MAIL: </h2>' + user.email + '<br><a type="button" href="/logout">LOGOUT</a>');
                }
            }
        });
});

router.get('/logout', function (req, res, next) {
    if (req.session) {
        //delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;


