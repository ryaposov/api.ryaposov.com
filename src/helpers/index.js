// Concat error messages
module.exports.prepareErrors = (validationErrors) => {
	validationErrors.reduce((a, b, i) => {
		return a + (i != 0 ? '; ' : '') + b.msg
	}, '')
}
