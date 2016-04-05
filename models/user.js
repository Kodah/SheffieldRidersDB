var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

SALT_WORK_FACTOR = 10;
MAX_LOGIN_ATTEMPTS = 5;
LOCK_TIME = 60 * 5 * 1000; // 5 minute lock

POINTS_LOC_VISIT = 15;
POINTS_RACE_RACED = 10;
POINTS_RACE_WON = 50;
POINTS_RACE_SECOND = 25;
POINTS_RACE_THIRD = 10;

var spotSchema = new mongoose.Schema({
    name: String,
    visitCount: Number
});


var UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    quote: {
        type: String,
        default: ""

    },
    discipline: {
        type: String,
        default: ""
    },
    spots: {
        type: [spotSchema]
    },
    racesRaced: {
        type: Number,
        default: 0
    },
    racesWon: {
        type: Number,
        default: 0
    },
    racesSecond: {
        type: Number,
        default: 0
    },
    racesThird: {
        type: Number,
        default: 0
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Number
    }
}, {
  toObject: {
  virtuals: true
  },
  toJSON: {
  virtuals: true 
  }
});


UserSchema.virtual('riderRep').get(function() {
    var rep = 0;
    this.spots.forEach(function(spot){
        rep += spot.visitCount * POINTS_LOC_VISIT;
        console.log("virtual rep: ", rep);
    });

    if (!isNaN(this.racesWon)) {
        rep += this.racesWon * POINTS_RACE_WON
    };
    if (!isNaN(this.racesSecond)) {
        rep += this.racesSecond * POINTS_RACE_SECOND
    };
    if (!isNaN(this.racesThird)) {
        rep += this.racesThird * POINTS_RACE_THIRD
    };

    console.log("virtual rep: ", rep);
    return rep;
});

UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, callBack) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callBack(err);
        callBack(null, isMatch);
    });
};

UserSchema.methods.incLoginAttempts = function(callBack) {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: {
                loginAttempts: 1
            },
            $unset: {
                lockUntil: 1
            }
        }, callBack);
    }
    var updates = {
        $inc: {
            loginAttempts: 1
        }
    };
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + LOCK_TIME
        };
    }
    return this.update(updates, callBack);
};

var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

UserSchema.statics.getAuthenticated = function(username, password, callBack) {
    this.findOne({
        username: username
    }, function(err, user) {
        if (err) return callBack(err);

        if (!user) {
            return callBack(null, null, reasons.NOT_FOUND);
        }

        if (user.isLocked) {
            return user.incLoginAttempts(function(err) {
                if (err) return callBack(err);
                return callBack(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        user.comparePassword(password, function(err, isMatch) {
            if (err) return callBack(err);
            if (isMatch) {
                if (!user.loginAttempts && !user.lockUntil) return callBack(null, user);
                var updates = {
                    $set: {
                        loginAttempts: 0
                    },
                    $unset: {
                        lockUntil: 1
                    }
                };
                return user.update(updates, function(err) {
                    if (err) return callBack(err);
                    return callBack(null, user);
                });
            }
            user.incLoginAttempts(function(err) {
                if (err) return callBack(err);
                return callBack(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

User = mongoose.model('User', UserSchema);
module.exports = User;

User.schema.path('email').validate(function (value, respond) {                                                                                           
    User.findOne({ email: value }, function (err, user) {                                                                                                
        if(user) {
            respond(false)
        } else 
        {
            respond(true);
        }                                                                                                                          
    });                                                                                                                                                  
}, 'This email address is already registered');

User.schema.path('username').validate(function (value, respond) {                                                                                           
    User.findOne({ username: value }, function (err, user) {                                                                                                
        if(user) {
            respond(false)
        } else 
        {
            respond(true);
        }                                                                                                                         
    });                                                                                                                                                  
}, 'This surname is already registered');

