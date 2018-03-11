'use strict'

module.exports = function (ctx) {
	const { mongoose, server } = ctx;
	const errs = require('restify-errors'),
				jwt = require('jsonwebtoken'),
				Router = require('restify-router').Router,
				Models = require('../models'),
				{ prepareErrors } = require('../helpers'),
				config = require('../config');
	// Initializing Model
	let Model

	// Router Init
	const router = new Router();

	// Validate Token
	router.use((req, res, next) => {
		// check header or url parameters or post parameters for token
	  let token = req.body.token || req.query.token || req.headers.authorization;

	  // decode token
	  if (token) {
	    // verifies secret and checks exp
	    jwt.verify(token, config.key, (err, decoded) => {
	      if (err) {
	        res.send({
						success: false,
						message: 'Failed to authenticate token.'
					});
					next(false)
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;
	        next();
	      }
	    });
	  } else {
			res.send(new errs.ForbiddenError('No token provided.'))
			return next(false)
	  }
	})

	// Validate collection param
	router.use((req, res, next) => {
		// Validate ID parameter
		req.assert('collection', 'Invalid ID parameter')
			.notEmpty()
			.len(1, 50)
			.isAlphanumeric()

		// Get validation errors
		let validationErrors = req.validationErrors()

		// Check we have schema of this collection name
		let modelExists = req.params.collection in Models

		if (validationErrors === null && modelExists) {
			// Setting correct model based on collection parameter
			Model = Models[req.params.collection]
			return next()
		} else {
			let msg = validationErrors === null
				? 'Validation error' : prepareErrors(validationErrors)
			res.send(new errs.BadRequestError(msg))
			return next(false)
		}
	})

	// Create doc
	function create (req, res, next) {
		console.log(req.body)
		// Save doc
		Model(req.body).save(function(err, doc) {
		  if (err) {
				next(new errs.BadRequestError(err))
			} else {
				res.send(doc);
				next();
			}
		});
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

			Model.update({ _id: req.params.id }, body)
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
			// Find doc
			Model.deleteOne({ _id: req.params.id })
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
			// Find docs
			Model.deleteMany({ _id: { $in: ids } })
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

	// List subroutes
	router.post('/create', create);
	router.post('/delete', deleteByIds);
	router.del('/:id', deleteById);
	router.put('/:id', editById);
	router.patch('/:id', editById);

	return router;
}
