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
        "riderRep": 1
    }).sort('riderRep').exec(function(err, riders) {
        res.json(riders);
    });

});

//Get recipe by ID
router.get('/:username', function(req, res, next) {
    User.find({
        username: req.params.username
    }, {
        "spotsVisted": 1,
        "riderRep": 1,
        "discipline": 1,
        "quote": 1,
    }).exec(function(err, user) {
        if (err) throw err;

        res.json(user);
    });
});

router.post('/checkin', function(req, res, next) {
    var username = CONFIG.getUserToken(req.get("authorization"));

    var conditions = {
            "username": username,
            "spotsVisted.name": req.body.locationName
        },

        update = {
            "$inc": {
                "spotsVisted.$.visitCount": 1 
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