'use strict'

module.exports = function(ctx) {
	const Router = require('restify-router').Router;
	const router = new Router();

	let crud = require('./routes/crud')(ctx),
			projects = require('./routes/crud')(ctx);

	router.get('/', function (req, res, next) {
		res.send('Ok!');
		next();
	});

	// Subroutes
	router.add('/crud/:collection', crud);
	router.add('/projects', projects);

	// Aply subroutes routes ro restify
	router.applyRoutes(ctx.server);

	return router;
}
