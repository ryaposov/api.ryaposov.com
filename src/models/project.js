var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Project', new Schema({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
	client: { type: String, default: '' },
  category: [String],
	goal: { type: String, default: '' },
	year: { type: Number, default: 2018 },
	links: [{ type: String, lowercase: true, trim: true }],
	thumbnail: { type: String, lowercase: true, trim: true, default: '' },
	image: { type: String, lowercase: true, trim: true, default: '' },
	gallery: [{ image: String, caption: String }],
	colors: {
    main: { type: String, default: '#000000' },
    second: { type: String, default: '#000000' },
  },
	published: { type: Boolean, default: 0 }
}, { timestamps: true }));
