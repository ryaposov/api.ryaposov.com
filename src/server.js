'use strict'

/**
 * Module Dependencies
 */
const config = require('./config'),
	restify = require('restify'),
	mongoose = require('mongoose'),
	mongodb = require('mongodb').MongoClient,
	restifyValidator = require('restify-validator'),
	corsMiddleware = require('restify-cors-middleware');

/**
 * Initialize Server
 */
const server = restify.createServer({
  name: config.name,
  version: config.version
})

const cors = corsMiddleware({
  origins: [/^https?:\/\/localhost(:[\d]+)?$/, /^https?:\/\/ryaposov.com(:[\d]+)?$/],
  allowHeaders: ['Authorization']
})

/**
 * Bundled Plugins (http://restify.com/#bundled-plugins)
 */
server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(restifyValidator);

/**
 * Lift Server, Connect to DB & Require Route File
 */

server.listen(config.port, () => {
	mongoose.connect(config.db.uri)
		.then(() => {
			console.log(
			  '%s v%s ready to accept connections on port %s in %s environment.',
			  server.name,
			  config.version,
			  config.port,
			  config.env
			)
			require('./routes')({mongoose: mongoose.connection, server })
		})
		.catch(err => {
			console.log('An error occurred while attempting to connect to mongodb', err)
			process.exit(1)
		});
})
