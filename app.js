var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var request = require('request');
var scraper = require('google-search-scraper');


//connect to mongodb
mongoose.connect('mongodb://localhost/EasyReads');
var db = mongoose.connection;

//handle mongo erro
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    //we`re connected
});

//use sessions for tracking logins
app.use(session({
    secret: 'Read more',
    resave: true,
    saveUnitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));


//parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //changed this to true because the other app did must research more
app.set('view engine', 'pug');

//serve static files from template
app.use(express.static(__dirname + '/templateLogReg'));//radical changes will definitely not work

//include routes
var routes = require('./routes/router');
app.use('/', routes);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

//error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

//Listen on port 3000
app.listen(3000, function () {
    console.log("Express app listening on port 3000");
});


