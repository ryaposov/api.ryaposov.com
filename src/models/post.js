var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Post', new Schema({
    title: String,
    subtitle: String,
    tags: [String],
		text: String,
		published: Boolean
}, { timestamps: true }));
