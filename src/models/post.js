var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Post', new Schema({
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    tags: [String],
		introtext: { type: String, default: '' },
		text: { type: String, default: '' },
		published: { type: Boolean, default: 0 }
}, { timestamps: true }));
