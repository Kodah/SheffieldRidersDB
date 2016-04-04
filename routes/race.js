var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var CONFIG = require('../config/conf.js');

//Models
var Race = mongoose.model('Race');
var Racer = mongoose.model('Racer');


router.post('/', function(req, res, next) {
    var username = CONFIG.getUserToken(req.get("authorization"));
    var race = new Race();

    race.title = req.body.title;
    race.creator = username;
    race.location = req.body.location;
    race.date = req.body.date;

    req.body.racers.forEach(function(_racer) {
        var racer = new Racer({
            name: _racer.name
        });
        race.racers.push(racer);
    });

    race.save(function(err) {
        if (!err) {
            res.send("Race saved").status(200);
        } else {
            console.log(err);
            res.status(500).send(err);
        }
    });
});

router.get('/', function(req, res, next) {
    Race.find({}).exec(function(err, races) {
        res.json(races);
    });
})

router.get('/user', function(req, res, next) {
    var username = CONFIG.getUserToken(req.get("authorization"));

    Race.find({
        "racers.name": username
    }).exec(function(err, races) {
        res.json(races);
    });
})

router.put('/', function(req, res, next) {

    var startDate = req.body.startDate
    var finishDate = req.body.finishDate
    var id = mongoose.Types.ObjectId(req.body.remoteID)
    var condition = {
            "racers._id": id
        },
        update = {},
        options = {
            upsert: true
        };

    Race.findOne(condition, function(err, race) {
        if (err) {
            res.json(err)
        };
        console.log("Race Found - ", race);

        race.racers.forEach(function(_racer) {
            console.log("Racer Found -", _racer);
            if (_racer._id.equals(id)) {
                if (startDate != null) {
                    _racer.startDate = startDate;
                };
                if (finishDate != null) {
                    _racer.finishDate = finishDate;
                };
            };
        })
        race.save(function(err) {
            if (!err) {
                res.send("Race updated").status(200);
            } else {
                console.log(err);
                res.status(500).send(err);
            }
        });
    });
})


module.exports = router;