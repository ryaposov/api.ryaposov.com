module.exports = (app) => {
  const defaultConfig = require('../config/default.js');
  const prodConfig = require('../config/production.js');
  const activeConfig = process.env.NODE_ENV === 'production' ? prodConfig : defaultConfig;

  const convert = (current) => {
    const result = Array.isArray(current) ? [] : {};
    Object.keys(current).forEach(name => {
      let value = current[name];
      if (typeof value === 'object' && value !== null) {
        value = convert(value);
      }
      if (typeof value === 'string') {
        if (value.indexOf('\\') === 0) {
          value = value.replace('\\', '');
        } else {
          if (process.env[value]) {
            value = process.env[value];
          }
        }
      }

      result[name] = value;
    });

    return result;
  };

  const conf = convert(activeConfig);

  if (!app) {
    return conf;
  }

  Object.keys(conf).forEach(name => {
    const value = conf[name];

    app.set(name, value);
  });
  return conf;
};
