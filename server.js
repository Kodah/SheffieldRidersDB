'use strict';

var express = require('express');
var port = process.env.PORT || 9000;
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var config = require('./config/conf.js');
require('./models/models.js').initialize();


//Routes
var registrationRoute = require('./routes/registration');
var authenticationRoute = require('./routes/authentication');
var userProfileRoute = require('./routes/userProfile');


mongoose.connect('mongodb://localhost/DB_ShefRiders');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(expressJWT({secret: config.JWTSECRET}).unless(config.filterRoutes));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

router.get('/', function(req, res, next) {
    res.json('Welcome to Shef riders :)');
});

app.use('/', router);
app.use('/register', registrationRoute);
app.use('/authentication', authenticationRoute);
app.use('/userProfile', userProfileRoute);

app.listen(port);
