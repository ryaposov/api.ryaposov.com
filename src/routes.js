'use strict'

module.exports = function(ctx) {
	const Router = require('restify-router').Router;
	const router = new Router();

	let projects = require('./routes/projects')(ctx.db)

	router.get('/', function (req, res, next) {
		res.send('Ok!');
		next();
	});

	// Subroutes
	router.add('/projects', projects);

	// Aply subroutes routes ro restify
	router.applyRoutes(ctx.server);

	return router;
}
