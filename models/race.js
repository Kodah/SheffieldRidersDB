var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Racer = mongoose.model('Racer').schema;

var RaceSchema = new Schema({
    title: String,
    creator: String,
    location: String,
    racers: [Racer],
    date: Number,
    finished: {
        type: Boolean,
        default: false
    }
});

Race = mongoose.model('Race', RaceSchema);
module.exports = Race;