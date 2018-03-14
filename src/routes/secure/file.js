'use strict'

module.exports = function (ctx) {
	const { mongoose, server } = ctx;
	const errs = require('restify-errors'),
		jwt = require('jsonwebtoken'),
		fs = require('fs'),
		Router = require('restify-router').Router,
		Models = require('../../models'),
		{ prepareErrors } = require('../../helpers'),
		config = require('../../config');

	// Router Init
	const router = new Router();

	// Validate ID
	function validateId (req, res, next) {
		// Validate ID parameter
		req.assert('id', 'Invalid ID parameter')
			.notEmpty()
			.len(24, 24)
			.isAlphanumeric();

		// Get validation errors
		let validationErrors = req.validationErrors();
		if (validationErrors !== null) {
			return next(new errs.BadRequestError());
		} else {
			return next();
		}
	}

	// Validate Token
	router.use((req, res, next) => {
		// check header or url parameters or post parameters for token
		let token = req.headers.authorization || false ;

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

	// Get all file
	function getFiles (req, res, next) {
		let path = config.storage + req.params.id;
		if (fs.existsSync(path)) {
			let files = fs.readdirSync(path);
			res.send(files);
		} else {
			res.send([]);
		}
	}

	// Get all file
	function deleteFile (req, res, next) {
		// Validate name parameter
		let name = req.query && 'name' in req.query && req.query.name

		// Get validation errors
		let validationErrors = req.validationErrors();
		if (validationErrors !== null || !name) {
			return next(new errs.BadRequestError());
		}

		let file = config.storage + req.params.id + '/' + name
		fs.unlinkSync(file);

		res.send({ success: true });
	}

	// List subroutes
	router.get('/', validateId, getFiles);
	router.del('/', validateId, deleteFile);

	return router;
}
