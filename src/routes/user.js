'use strict'

module.exports = function (ctx) {
	const { mongoose, server } = ctx;
	const errs = require('restify-errors'),
				jwt = require('jsonwebtoken'),
				bcrypt = require('bcrypt'),
				Router = require('restify-router').Router,
				User = require('../models/user'),
				{ prepareErrors } = require('../helpers'),
				config = require('../config');

	// Router Init
	const router = new Router();

	// // Register user
	// function register (req, res, next) {
	// 	let newUser = new User(req.body);
	//   newUser.password = bcrypt.hashSync(req.body.password, 10);
	//   newUser.save(function(err, user) {
	//     if (err) {
	//       return res.status(400).send({
	//         message: err
	//       });
	//     } else {
	//       user.password = undefined;
	//       return res.send(user);
	//     }
	//   });
	// }

	// Sign in user
	function signIn (req, res, next) {
		// Validate parameters
		if (!req.body || !('email' in req.body) || !req.body.email) {
			res.send(req.body)
			return next(false)
		}

		User.findOne({ email: req.body.email })
			.then(user => {
		    if (!user) {
					res.send(new errs.ForbiddenError('Authentication failed. User not found. 1'))
					return next(false)
		    } else if (user) {
		      if (!user.comparePassword(req.body.password)) {
						res.send(new errs.ForbiddenError('Authentication failed. User not found. 2'))
		      } else {
		        res.send({token: jwt.sign({ email: user.email, fullName: user.fullName, _id: user._id}, config.key)});
		      }
					return next(false)
		    } else {
					res.send(new errs.ForbiddenError('Authentication failed. User not found. 3'))
					return next(false)
				}
			})
			.catch(err => {
				res.send(new errs.BadRequestError())
				return next(false)
				throw err;
			});
	}

	// List subroutes
	// router.post('/register', register);
	router.post('/sign-in', signIn);

	return router;
}
