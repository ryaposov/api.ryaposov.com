var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function getCurrentDate (d) {
	return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

let PorjectSchema = new Schema({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
	client: { type: String, default: '' },
	size: { type: String, default: '' },
	date: { type: Date, default: getCurrentDate(new Date()) },
  category: [String],
	goal: { type: String, default: '' },
	links: [{ type: String, lowercase: true, trim: true }],
	thumbnail: { type: String, lowercase: true, trim: true, default: '' },
	image: { type: String, lowercase: true, trim: true, default: '' },
	gallery: [{ image: String, caption: String }],
	colors: {
    main: { type: String, default: '#000000' },
    second: { type: String, default: '#000000' },
  },
	published: { type: Boolean, default: 0 }
}, { timestamps: true });

PorjectSchema.methods.sortField = () => ('date')

module.exports = mongoose.model('Project', PorjectSchema);
