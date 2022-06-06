const cacheProxy = require('./app/utils/cacheProxy');
const port = process.env.PORT || 6500;
const target = process.env.TARGET || 'http://localhost:3000/';
cacheProxy(target, port);
