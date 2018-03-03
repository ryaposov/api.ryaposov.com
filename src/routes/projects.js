'use strict'

module.exports = function(db) {
	const errs = require('restify-errors'),
				ObjectId = require('mongodb').ObjectId,
				Router = require('restify-router').Router;

	function all (req, res, next) {
		// Return all projects
		db.collection('projects').find().toArray(function(err, items) {
			res.send(items);
			next();
    });
	}

	function byId (req, res, next) {
		// Validate ID parameter
		req.assert('id', 'Invalid ID parameter')
			.notEmpty()
			.len(24, 24)
			.isAlphanumeric();

		// Get validation errors
		let validationErrors = req.validationErrors()

		if (validationErrors === null) {
			// Find project
			db.collection('projects')
				.findOne(new ObjectId(req.params.id), (err, item) => {
					if (item) {
						res.send(item);
						next();
					} else {
						next(new errs.NotFoundError(
							'No project with such ID'
						));
					}
				});
		} else {
			// Validation error
			next(new errs.NotFoundError(
				validationErrors.reduce((a, b, i) => {
					return a + (i != 0 ? '; ' : '') + b.msg
				}, '')
			));
		}
	}

	// Router Init
	const router = new Router();

	// List subroutes
	router.get('/', all);
	router.get('/:id', byId);

	return router;
}
