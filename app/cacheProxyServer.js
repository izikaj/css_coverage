const express = require('express');
const fs = require('fs');
const path = require('path');
const URL = require('url').URL;
const parsedYaml = require('./utils/parsedYaml');
const {
  createProxyMiddleware,
  responseInterceptor
} = require('http-proxy-middleware');

const cred = parsedYaml('credentials.yml').basic;
const app = express();

const cacheRoot = (root) => {
  const uri = new URL(root);
  return path.join(path.resolve('dist/cache'), uri.hostname);
}

const cachePath = (root, pathname) => {
  if (path.extname(pathname) === '') pathname = `${pathname}/index.html`
  return path.join(root, pathname);
};

const prepareParentDir = (filepath) => {
  const dirname = path.dirname(filepath);
  if (!fs.existsSync(dirname)) {
    return fs.mkdirSync(dirname, {
      recursive: true
    });
  }
  return true;
};

const setup = (app, target) => {
  const cacheDir = cacheRoot(target);

  // cache reader
  app.use((req, res, next) => {
    if (req.method != 'GET') return next();

    const targetPath = cachePath(cacheDir, req.path);
    if (!fs.existsSync(targetPath)) return next();

    res.sendFile(targetPath, {
      maxAge: 60000,
      headers: {
        'x-from-cache': 'yes'
      }
    });
  });

  // cache writer
  app.use(createProxyMiddleware({
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    auth: `${cred.username}:${cred.password}`,
    onProxyRes: responseInterceptor(async (responseBuffer, _proxyRes, req, res) => {
      if (req.method !== 'GET' || res.statusCode !== 200) return responseBuffer;

      const targetPath = cachePath(cacheDir, req.path);
      prepareParentDir(targetPath);
      fs.writeFile(targetPath, responseBuffer, () => {});

      return responseBuffer;
    }),
  }));
}

process.on('message', (message) => {
  const data = JSON.parse(message);
  console.warn('cacheProxyServer <<<', data);
  switch (data.type) {
    case 'start':
      setup(app, data.target);
      return app.listen(data.port, () => {
        console.log(`Proxy listening at http://localhost:${data.port}`);
      });

    default:
      process.send('{"type": "pong", "status": "ok"}');
  }
});
