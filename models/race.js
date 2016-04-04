var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var racerSchema = new mongoose.Schema({
    name: String,
    startDate: Date,
    finishDate: Date
});

var raceSchema = new mongoose.Schema({
    title: String,
    location: String,
    racers: [racerSchema],
    date: Date 
});

Race = mongoose.model('Race', raceSchema);
module.exports = Race;