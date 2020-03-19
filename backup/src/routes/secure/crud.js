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
	// Initializing Model
	let Model

	// Router Init
	const router = new Router();

	// Edit doc field by ID
	function editFieldById(body, id) {
		return Model.update({ _id: id }, { $set: body })
	}

	// Delete file is exists
	function deleteFileExists (path) {
		if (fs.existsSync(path)) {
			let files = fs.readdirSync(path);

			for (const file of files) {
				fs.unlinkSync(path + '/' + file);
			}

			fs.rmdirSync(path)
		}
	}

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
			let msg = validationErrors === null ?
				'Validation error' : prepareErrors(validationErrors)
			res.send(new errs.BadRequestError(msg))
			return next(false)
		}
	})

	// Create doc
	function create(req, res, next) {
		// Save doc
		Model(req.body).save(function (err, doc) {
			if (err) {
				next(new errs.BadRequestError(err))
			} else {
				res.send(doc);
				next();
			}
		});
	}

	// Edit doc by ID
	function editById(req, res, next) {
		// Handle request body
		let body = req.body;
		delete body._id; // remove _id field
		// Check for method: update fields or entire doc
		body = req.method === 'PATCH' ? { $set: body } : body

		editFieldById(body, req.params.id)
			.then(success => {
				res.send(success);
				next();
			}).catch(err => {
				next(new errs.BadRequestError(err));
			});
	}

	// Delete doc by ID
	function deleteById(req, res, next) {
		// Find doc
		Model.deleteOne({ _id: req.params.id })
			.then(deleted => deleteFileExists(config.storage + req.params.id))
			.then(folderDeleted => res.send({ success: true}));
	}

	// Delete docs by IDs
	function deleteByIds(req, res, next) {
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

	// Get all docs
	function getAll(req, res, next) {
		// Return all docs
		Model.find().sort({
				[Model.schema.methods.sortField()]: -1
			})
			.then(items => {
				res.send(items);
				next();
			})
			.catch(err => {
				console.log(err)
			});
	}

	// Get doc by ID
	function getById(req, res, next) {
		// Find doc
		Model.findOne({ _id: req.params.id })
			.then(item => {
				item ? (res.send(item), next()) :
					next(new errs.NotFoundError("No doc with such ID"))
			})
			.catch(err => {
				res.send(err);
			});
	}

	// Upload file
	function uploadFile (req, res, next) {
		// Define storage and directory
		let storage = config.storage;
		let dir = storage + req.params.id;
		let file = req.files.qqfile;

		// Create directory
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);

		// Read the file
    fs.readFile(file.path, (err, data) => {
      if (err) next(new errs.BadGatewayError(err));

      // Write the file
      fs.writeFile(`${dir}/${file.name}`, data, (err) => {
        if (err) next(new errs.BadGatewayError(err));
				editFieldById({ image: file.name }, req.params.id)
					.then(result => {
						res.send(202, { file, message: 'File uploaded' });
					})
					.catch(error => {
						res.send(202, { file, message: error });
					})
      });

      // Delete the file
      fs.unlink(file.path, (err) => {
        if (err) next(new errs.BadGatewayError(err));
      });
    });
	}

	// List subroutes
	router.get('/', getAll);
	router.post('/create', create);
	router.post('/delete', deleteByIds);
	router.get('/:id', validateId, getById);
	router.del('/:id', validateId, deleteById);
	router.put('/:id', validateId, editById);
	router.patch('/:id', validateId, editById);
	router.post('/:id/upload', validateId, uploadFile);

	return router;
}
