var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var UrlSchema = new Schema(
    {
        Url: { type: String, required: true }
    }
);

UrlSchema
.get(function () {
    return '/home/mine' + this._id;
});

UrlSchema
.get(function () {
    return moment(this.day_made).format('MMMM Do, YYYY');
})


var Url = mongoose.model('Url', UrlSchema);

module.exports = Url;