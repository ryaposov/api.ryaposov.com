'use strict'

module.exports = function (ctx) {
	const { mongoose, server } = ctx;
	const errs = require('restify-errors'),
				Router = require('restify-router').Router,
				Models = require('../models'),
				{ prepareErrors } = require('../helpers');
	// Initializing Model
	let Model

	// Router Init
	const router = new Router();

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
		let modelExists = Object.keys(Models).some(name => {
			return name === req.params.collection
		})

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

	// Get all docs
	function getAll (req, res, next) {
		// Return all docs
		Model.find({ published: 1 })
			.then(items => {
				res.send(items);
				next();
			})
			.catch(err => {
				console.log(err)
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
			Model.findOne({ _id: req.params.id, published: 1 })
				.then(item => {
					item ? ( res.send(item), next() )
						: next( new errs.NotFoundError("No doc with such ID") )
				})
				.catch(err => {
					res.send(err);
				});
		} else {
			// Validation error
			let msg = prepareErrors(validationErrors);
			next(new errs.BadRequestError(msg))
		}
	}

	// List subroutes
	router.get('/', getAll);
	router.get('/:id', getById);

	return router;
}
