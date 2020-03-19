var mongoose = require('mongoose'),
		bcrypt = require('bcrypt'),
		Schema = mongoose.Schema;

let UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		required: true
	},
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
}, { timestamps: true })

UserSchema.methods.comparePassword = function (pass) {
	return bcrypt.compareSync(pass, this.password)
}

module.exports = mongoose.model('User', UserSchema);
