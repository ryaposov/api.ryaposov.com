'use strict'

module.exports = function(ctx) {
	const Router = require('restify-router').Router;
	const router = new Router();

	let projects = require('./routes/projects')(ctx.db)

	// Subroutes
	router.add('/projects', projects);

	// Aply subroutes routes ro restify
	router.applyRoutes(ctx.server);

	return router;
}
