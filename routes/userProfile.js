var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var CONFIG = require('../config/conf.js');

//Models
var User = mongoose.model('User');

router.get('/', function(req, res, next) {

    User.find({}, {
        "username": 1,
        "riderRep": 1,
        "spots": 1,
        "riderRep": 1,
        "discipline": 1,
        "quote": 1,
        "username": 1,
        "racesRaced": 1,
        "racesWon": 1,
        "racesSecond": 1,
        "racesThird": 1

    }).sort('riderRep').exec(function(err, riders) {
        res.json(riders);
    });

});

//Get recipe by ID
router.get('/foruser/:username', function(req, res, next) {
    User.findOne({
        username: req.params.username
    }, {
        "spots": 1,
        "riderRep": 1,
        "discipline": 1,
        "quote": 1,
        "username": 1
    }).exec(function(err, user) {
        if (err) throw err;

        res.json(user);
    });
});

router.get('/owner', function(req, res) {
    var username = CONFIG.getUserToken(req.get("authorization"));

    User.findOne({
        username: username
    }, {
        "spots": 1,
        "riderRep": 1,
        "discipline": 1,
        "quote": 1,
        "username": 1
    }).exec(function(err, user) {
        if (err) throw err;

        res.json(user);
    });
})


router.post('/checkin', function(req, res, next) {
    var username = CONFIG.getUserToken(req.get("authorization"));

    var conditions = {
            "username": username,
            "spots.name": req.body.locationName
        },

        update = {
            "$inc": {
                "spots.$.visitCount": 1 
            }
        },
        options = {
            multi: false
        };

    User.findOneAndUpdate(conditions, update, options, callback);

    function callback(err, numAffected) {
        if (err) {
            res.json(err)
        } else if (numAffected == null) {
            res.json("Spot doesnt exist");
        } else {
            res.json("Success");
        };
    };

});



module.exports = router;