'use strict'

module.exports = function(ctx) {
	const Router = require('restify-router').Router;
	const router = new Router();

	let crud = require('./routes/crud')(ctx),
			secureCrud = require('./routes/secure-crud')(ctx),
			user = require('./routes/user')(ctx),
			search = require('./routes/search')(ctx);

	router.get('/', function (req, res, next) {
		res.send('Ok!');
		next();
	});

	// Subroutes
	router.add('/user', user);
	router.add('/search', search);
	router.add('/crud/:collection', crud);
	router.add('/secure/:collection', secureCrud);

	// Aply subroutes routes ro restify
	router.applyRoutes(ctx.server);

	return router;
}
