var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

SALT_WORK_FACTOR = 10;
MAX_LOGIN_ATTEMPTS = 5;
LOCK_TIME = 60 * 5 * 1000; // 5 minute lock

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
        required: true
    },
    quote: {
        type: String,
        default: ""

    },
    discipline: {
        type: String,
        default: ""
    },
    riderRep: {
        type: Number,
        required: true,
        default: 0
    },
    spots: {
        type: [spotSchema]
    },

    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Number
    }
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

