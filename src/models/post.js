var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let PostSchema = new Schema({
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    tags: [String],
		introtext: { type: String, default: '' },
		text: { type: String, default: '' },
		published: { type: Boolean, default: 0 }
}, { timestamps: true });

PostSchema.methods.sortField = () => ('createdAt')

module.exports = mongoose.model('Post', PostSchema);
