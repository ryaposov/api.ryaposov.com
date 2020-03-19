module.exports = {
  'host': 'localhost',
  'port': 3030,
  'public': '../public/',
  'paginate': {
    'default': 10,
    'max': 100
  },
  'authentication': {
    'entity': 'user',
    'service': 'users',
    'secret': process.env.AUTH_SECRET,
    'authStrategies': [
      'jwt',
      'local'
    ],
    'jwtOptions': {
      'header': {
        'typ': 'access'
      },
      'audience': 'https://yourdomain.com',
      'issuer': 'feathers',
      'algorithm': 'HS256',
      'expiresIn': '1d'
    },
    'local': {
      'usernameField': 'email',
      'passwordField': 'password'
    }
  },
  'mongodb': process.env.DB_URI
};
