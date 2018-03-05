'use strict'

module.exports = function (db) {
	const errs = require('restify-errors'),
				ObjectId = require('mongodb').ObjectId,
				Router = require('restify-router').Router;

	// Get all projects
	function getAll (req, res, next) {
		// Return all projects
		db.collection('projects')
			.find()
			.toArray((err, items) => {
				res.send(items);
				next();
	    });
	}

	// Create project
	function create (req, res, next) {
		// Handle request body
		let body = req.body;
		delete body._id;

		if ('ids' in body) {
			// Validate ids in body
			body = body.ids.length ? body.ids : []
			if (body.length) {
				body.forEach(item => {
					delete item._id;
				})

				console.log(body)
			}
		}

		// Find project
		db.collection('projects')
			.insert(body, (err, item) => {
				if (err) {
					next(new errs.BadRequestError(err))
				} else {
					res.send(item);
					next();
				}
			});
	}

	// Get project by ID
	function getById (req, res, next) {
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
				.findOne(new ObjectId(req.params.id))
				.then(item => {
					if (item) {
						res.send(item);
						next();
					} else {
						next(new errs.NotFoundError('No project with such ID'));
					}
				})
				.catch(err => {
					res.send(err);
				});
		} else {
			// Validation error
			let msg = validationErrors.reduce((a, b, i) => {
				return a + (i != 0 ? '; ' : '') + b.msg
			}, '');
			next(new errs.BadRequestError(msg))
		}
	}

	// Edit project by ID
	function editById (req, res, next) {
		// Validate ID parameter
		req.assert('id', 'Invalid ID parameter')
			.notEmpty()
			.len(24, 24)
			.isAlphanumeric();

		// Get validation errors
		let validationErrors = req.validationErrors()

		if (validationErrors === null) {
			// Handle request body
			let body = req.body;
			delete body._id; // remove _id field
			// Check for method: update fields or entire doc
			body = req.method === 'PATCH' ? { $set: body } : body

			// Update query
			let query = { _id: new ObjectId(req.params.id) }

			db.collection('projects').update(query, body)
			.then(success => {
				res.send(success);
				next();
			}).catch(err => {
				next(new errs.BadRequestError(err));
			});
		} else {
			// Validation error
			let msg = validationErrors.reduce((a, b, i) => {
				return a + (i != 0 ? '; ' : '') + b.msg
			}, '');
			next(new errs.BadRequestError(msg))
		}
	}

	// Delete project by ID
	function deleteById (req, res, next) {
		// Validate ID parameter
		req.assert('id', 'Invalid ID parameter')
			.notEmpty()
			.len(24, 24)
			.isAlphanumeric();

		// Get validation errors
		let validationErrors = req.validationErrors()

		if (validationErrors === null) {
			// Update query
			let query = { _id: new ObjectId(req.params.id) }

			// Find project
			db.collection('projects').deleteOne(query)
				.then(msg => {
					res.send(msg);
					next();
				})
				.catch(err => {
					next(new errs.BadRequestError(err));
				});
		} else {
			// Validation error
			let msg = validationErrors.reduce((a, b, i) => {
				return a + (i != 0 ? '; ' : '') + b.msg
			}, '');
			next(new errs.BadRequestError(msg))
		}
	}

	// Delete projects by IDs
	function deleteByIds (req, res, next) {
		// Validate ids in body
		let ids = 'ids' in req.body ? req.body.ids : false

		if (ids && ids.length) {
			ids = ids.map(id => new ObjectId(id))
			let query = { _id: { $in: ids } }
			// Find project
			db.collection('projects').deleteMany(query)
				.then(msg => {
					res.send(msg);
					next();
				})
				.catch(err => {
					next(new errs.BadRequestError(err));
				});
		} else {
			// Validation error
			next(new errs.BadRequestError('IDs array not valid'))
		}
	}

	// Router Init
	const router = new Router();

	// List subroutes
	router.get('/', getAll);
	router.post('/create', create);
	router.post('/delete', deleteByIds);

	router.get('/:id', getById);
	router.put('/:id', editById);
	router.patch('/:id', editById);
	router.del('/:id', deleteById);

	return router;
}
