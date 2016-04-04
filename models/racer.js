var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RacerSchema = new mongoose.Schema({
    name: String,
    startDate: Number,
    finishDate: Number
});

Racer = mongoose.model('Racer', RacerSchema);
module.exports = Racer;