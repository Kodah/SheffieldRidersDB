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
