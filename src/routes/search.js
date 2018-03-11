'use strict'

module.exports = function (ctx) {
	const { mongoose, server } = ctx;
	const errs = require('restify-errors'),
				jwt = require('jsonwebtoken'),
				bcrypt = require('bcrypt'),
				Router = require('restify-router').Router,
				Models = require('../models'),
				{ prepareErrors } = require('../helpers'),
				config = require('../config');

	// Router Init
	const router = new Router();

	async function searchInModel (model, req) {
		return await model.find(
			{ $text: {$search: req.query.s} },
			{ score: {$meta: 'textScore'} }
		).sort({ score: {$meta:'textScore'} });
	}

	async function querySearch (req, res, next, collection = false) {
		if (!('s' in req.query) && !req.query.s) {
			res.send(new errs.BadRequestError('Wrong search params'))
			return next(false)
		}

		let results = []

		if (collection) {
			results = await searchInModel(Models[collection], req);
		} else {
			let projects = await searchInModel(Models.projects, req);
			let posts = await searchInModel(Models.post, req);
			results = [].concat(projects, posts)
		}

		res.send(results);
		next();
	}

	function queryCollectionSearch (req, res, next) {
		// Validate ID parameter
		req.assert('collection', 'Invalid ID parameter')
			.notEmpty()
			.len(1, 50)
			.isAlphanumeric()

		// Get validation errors
		let validationErrors = req.validationErrors()
		let modelExists = req.params.collection in Models

		if (validationErrors === null && modelExists) {
			querySearch(req, res, next, req.params.collection)
		} else {
			res.send(new errs.BadRequestError('Wrong search params'))
			return next(false)
		}
	}

	// List subroutes
	router.post('/', querySearch);
	router.post('/:collection/', queryCollectionSearch);

	return router;
}
