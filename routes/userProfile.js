var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var CONFIG = require('../config/conf.js');

//Models
var User = mongoose.model('User');
var Race = mongoose.model('Race');

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

router.put('/racesRaced', function(req, res) {
    var username = CONFIG.getUserToken(req.get("authorization"));

    Race.findOne({
        _id: mongoose.Types.ObjectId(req.body.raceID)
    }).exec(function(err, race) {
        if (err) {
            res.json(err)
        }
        if (race.creator != username) {
            res.json("Only creator can award points");
        } else {

            var conditions = {
                username: {
                    "$in": req.body.racers
                }
            }
            var update = {
                "$inc": {
                    "racesRaced": 1
                }
            }
            var options = {
                multi: true
            };
            User.update(conditions, update, options, callback)

            function callback(err, numAffected) {
                if (err) {
                    res.json(err)
                } else if (numAffected == null) {
                    res.json("Noone updated");
                } else {
                    message = {
                        "Success": numAffected
                    };
                    res.json(message);
                };
            };
        }

    });

})

router.put('/podiums', function(req, res) {
    var username = CONFIG.getUserToken(req.get("authorization"));
    var update = {};
    var count = 0;

    Race.findOne({
        _id: req.body.raceID
    }).exec(function(err, race) {
        if (err) {
            res.json(err)
        }
        if (race.creator != username) {
            res.json("Only creator can award points");
        } else {
            req.body.medalists.forEach(function(medalist) {
                switch (medalist.result) {
                    case 1:
                        update = {
                            "$inc": {
                                racesWon: 1
                            }
                        };
                        break;
                    case 2:
                        update = {
                            "$inc": {
                                racesSecond: 1
                            }
                        };
                        break;
                    case 3:
                        update = {
                            "$inc": {
                                racesThird: 1
                            }
                        };
                        break;
                }

                User.findOneAndUpdate({
                    username: medalist.username
                }, update, {}, callback)

                function callback(err, user) {
                    if (err) {
                        res.json(err)
                    }
                    count += 1;
                    console.log(count, ":", req.body.medalists.length);
                    if (count == req.body.medalists.length) {
                        res.json('finished');
                    };
                };
            })
        }
    })
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