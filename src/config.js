'use strict'

module.exports = {
  name: 'portfolio-api',
  version: '0.0.1',
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8082,
  db: {
    uri: 'mongodb://127.0.0.1:27017/portfolio',
		database: 'portfolio'
  }
}
