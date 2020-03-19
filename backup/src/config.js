'use strict'

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  name: 'portfolio-api',
  version: '0.0.1',
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8082,
  db: {
    uri: isProd
			? 'mongodb://mongo:27017/portfolio' : 'mongodb://127.0.0.1:27017/portfolio',
		database: 'portfolio'
  },
	storage: `${__dirname}/../storage/`,
	key: 'WFpbCI6InJ5YXBvc292QG1lLm',
  allowedOrigins: [
		/^https?:\/\/localhost(:[\d]+)?$/,
		/^https?:\/\/ryaposov.com(:[\d]+)?$/,
		/^https?:\/\/admin.ryaposov.com(:[\d]+)?$/
	]
}
