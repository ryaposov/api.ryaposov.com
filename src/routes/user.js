'use strict'

module.exports = function (ctx) {
	const { mongoose, server } = ctx;
	const errs = require('restify-errors'),
				jwt = require('jsonwebtoken'),
				bcrypt = require('bcrypt'),
				Router = require('restify-router').Router,
				User = require('../models/user'),
				{ prepareErrors } = require('../helpers');

	// Router Init
	const router = new Router();

	// Register user
	function register (req, res, next) {
		let newUser = new User(req.body);
	  newUser.password = bcrypt.hashSync(req.body.password, 10);
	  newUser.save(function(err, user) {
	    if (err) {
	      return res.status(400).send({
	        message: err
	      });
	    } else {
	      user.password = undefined;
	      return res.send(user);
	    }
	  });
	}

	// Sign in user
	function signIn (req, res, next) {
		User.findOne({ email: req.body.email})
			.then(user => {
		    if (!user) {
					res.send(new errs.ForbiddenError('Authentication failed. User not found.'))
					return next(false)
		    } else if (user) {
		      if (!user.comparePassword(req.body.password)) {
						res.send(new errs.ForbiddenError('Authentication failed. Wrong password.'))
		      } else {
		        return res.send({token: jwt.sign({ email: user.email, fullName: user.fullName, _id: user._id}, 'RESTFUL_API')});
		      }
					return next(false)
		    }
			})
			.catch(err => {
				throw err;
			});
	}

	// List subroutes
	router.post('/register', register);
	router.post('/sign-in', signIn);

	return router;
}
