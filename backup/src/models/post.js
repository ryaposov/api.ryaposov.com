var mongoose = require('mongoose');
let { getCurrentDate } = require('../helpers');
var Schema = mongoose.Schema;

let PostSchema = new Schema({
		tags: [String],
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
		date: { type: Date, default: getCurrentDate(new Date()) },
		introtext: { type: String, default: '' },
		text: { type: String, default: '' },
		published: { type: Boolean, default: 0 }
}, { timestamps: true });

PostSchema.methods.sortField = () => ('date')

module.exports = mongoose.model('Post', PostSchema);
