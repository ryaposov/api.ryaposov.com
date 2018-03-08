'use strict'

module.exports = function (ctx) {
	const { db, server } = ctx;
	const errs = require('restify-errors'),
				ObjectId = require('mongodb').ObjectId,
				Router = require('restify-router').Router;

	// Validate collection param
	server.use(async (req, res, next) => {
		// Validate ID parameter
		req.assert('collection', 'Invalid ID parameter')
			.notEmpty()
			.len(1, 50)
			.isAlphanumeric();

		let collections = await db.collections()
		let collectionExists = collections.find(col => {
			return col.s.name === req.params.collection
		})

		// Get validation errors
		let validationErrors = req.validationErrors()

		if (validationErrors === null && collectionExists) {
			return next();
		} else {
			let msg = validationErrors === null
				? 'Validation error' : validationErrors.reduce((a, b, i) => {
					return a + (i != 0 ? '; ' : '') + b.msg
				}, '');
			res.send(new errs.BadRequestError(msg));
	  	return next(false);
		}
	})

	// Get all docs
	async function getAll (req, res, next) {
		// Return all docs
		db.collection(req.params.collection)
			.find()
			.toArray((err, items) => {
				res.send(items);
				next();
			});
	}

	// Create doc
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
			}
		}

		// Find doc
		db.collection(req.params.collection)
			.insert(body, (err, item) => {
				if (err) {
					next(new errs.BadRequestError(err))
				} else {
					res.send(item);
					next();
				}
			});
	}

	// Get doc by ID
	function getById (req, res, next) {
		// Validate ID parameter
		req.assert('id', 'Invalid ID parameter')
			.notEmpty()
			.len(24, 24)
			.isAlphanumeric();

		// Get validation errors
		let validationErrors = req.validationErrors()

		if (validationErrors === null) {
			// Find doc
			db.collection(req.params.collection)
				.findOne(new ObjectId(req.params.id))
				.then(item => {
					if (item) {
						res.send(item);
						next();
					} else {
						next(new errs.NotFoundError('No doc with such ID'));
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

	// Edit doc by ID
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

			db.collection(req.params.collection).update(query, body)
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

	// Delete doc by ID
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

			// Find doc
			db.collection(req.params.collection).deleteOne(query)
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

	// Delete docs by IDs
	function deleteByIds (req, res, next) {
		// Validate ids in body
		let ids = 'ids' in req.body ? req.body.ids : false

		if (ids && ids.length) {
			ids = ids.map(id => new ObjectId(id))
			let query = { _id: { $in: ids } }
			// Find doc
			db.collection(req.params.collection).deleteMany(query)
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
