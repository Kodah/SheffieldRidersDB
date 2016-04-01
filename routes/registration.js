var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();

//Models
var User = mongoose.model('User');

router.get('/', function(req, res, next) {
    res.json('Registration Api');
});

router.post('/', function(req, res, next) {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;

    user.spotsVisted = [
        {'name': 'Wharncliffe', 'visitCount': 0},
        {'name': 'BlackaMoor', 'visitCount': 0},
        {'name': 'LadyCanning', 'visitCount': 0},
        {'name': 'Grenocide', 'visitCount': 0},
        {'name': 'ParkwoodSprings', 'visitCount': 0},
        {'name': 'MonkeyBumps', 'visitCount': 0},
        {'name': 'BowlHills', 'visitCount': 0},
    ]
    
    user.save(function(err) {

        if (!err) {
            res.send("Registration successful").status(200);
        }
        else
        {
            if (err.code === 11000) {
                res.status(500).send('User already exists');
            };
            console.log(err);
            res.status(500).send(err); 
        }

    });

});
 



module.exports = router;
