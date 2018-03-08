'use strict'

/**
 * Module Dependencies
 */
const config = require('./config'),
	restify = require('restify'),
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
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
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
	mongodb.connect(config.db.uri, function(err, database) {
	  if (err) {
      console.log('An error occurred while attempting to connect to mongodb', err)
      process.exit(1)
    }
    console.log(
      '%s v%s ready to accept connections on port %s in %s environment.',
      server.name,
      config.version,
      config.port,
      config.env
    )

		// Connecting to database
		const db = database.db(config.db.database)

    require('./routes')({ db, server })
	});
})
