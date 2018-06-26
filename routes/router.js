var express = require('express');
var router = express.Router();
var User = require('../models/user');
var path = require('path');
var google = require('google');
const bodyParser = require('body-parser');
var scraper = require('google-search-scraper');
var DeathByCaptcha = require('deathbycaptcha');
var async = require('async');
var Url = require('../models/url');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

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
        
        
        google.resultsPerPage = 25;

        google(req.body.query + ' pdf', function (err, results){
            if (err) throw (err);

            res.render('query', { title: 'Query Results', links: results.links } );
        })
})

router.get('/add', function(req, res, next) {
    res.render('add', { title: "Add a new Link", url: null } );
})

router.get('/guest', function(req, res, next) {
    res.render('guest', { title: 'Guest User' } );
})

router.post('/add', function (req, res, next) {

    const errors = validationResult(req);
    
    var url = new Url(
        { Url: req.body.url }
    );

    User.findById(req.session.userId)
    .exec( function (error, user) {
    

        if(!errors.isEmpty()){
            res.render('add', { title: 'Add a new link', url: url, errors: errors.array() } );
        return;    
        }
        else {
            Url.findOne({ 'Url': req.body.url })
            .exec( function(err, found_url) {
                if (err) { return next(err); }

                if(found_url) {
                    res.redirect('/add');
                } else {
                    url.save(function (err) {
                        if (err) { return next(err); }
                            else {
                        res.render('addsuccess', { title: 'Success You have uploaded a book' } );
                            }
                    })
                }
            })
        }
    })
});    


//change this toonly happen at the press of a button
//create a neq router api a get one to render the initial push and a post one to handle data and push data back

//GET route after registering
// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
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


