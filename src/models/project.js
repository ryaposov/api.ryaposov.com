var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Project', new Schema({
  title: String,
  text: String,
  category: [String],
	goal: String,
	year: Number,
	links: [{ type: String, lowercase: true, trim: true }],
	thumbnail: { type: String, lowercase: true, trim: true },
	image: { type: String, lowercase: true, trim: true },
	gallery: [{ image: String, caption: String }],
	colors: {
    main: String,
    scond: String
  }
}, { timestamps: true }));
