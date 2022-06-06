const fs = require('fs');
const path = require('path');
const URL = require('url').URL;

const DUMP_TIMEOUT = 10000;

const cachePath = (link) => {
  const uri = new URL(link);
  let pathname = uri.pathname;
  if (path.extname(pathname) === '') pathname = `${pathname}/index.html`
  return path.join('dist', 'cache', uri.hostname, pathname);
};

const cacheTypesPath = (link) => {
  const uri = new URL(link);
  return path.join('dist', 'cache', uri.hostname, '_content_types.json');
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

const loadContentTypeCache = (cachePath) => {
  if (!fs.existsSync(cachePath)) return {};

  return JSON.parse(fs.readFileSync(cachePath));
}

const dumpContentTypeCache = (cachePath, data) => {
  prepareParentDir(cachePath);
  fs.writeFileSync(cachePath, JSON.stringify(data));
}

const contentTypeByPath = (pathname) => {
  switch (path.extname(pathname)) {
    case '.htm':
    case '.html':
      return 'text/html'
    case '.svg':
      return 'image/svg+xml'
    case '.json':
      return 'application/json'
    case '.js':
      return 'application/javascript'
    case '.ico':
      return 'image/x-icon'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.woff':
      return 'application/font-woff'
  }
}

async function withLocalCache(page, promise) {
  let contentTypeCachePath, contentTypeCache, dumpTimeout;

  const requestor = (request) => {
    if (request.isInterceptResolutionHandled()) return;

    const reqUrl = request.url();
    const method = request.method();
    const uri = new URL(reqUrl);
    contentTypeCachePath || (contentTypeCachePath = cacheTypesPath(reqUrl));
    contentTypeCache || (contentTypeCache = loadContentTypeCache(contentTypeCachePath));
    const localFile = cachePath(reqUrl);

    if (method !== 'GET') return request.continue();
    if (uri.protocol === 'data:') return request.continue();
    if (!fs.existsSync(localFile)) return request.continue();
    if (fs.lstatSync(localFile).isDirectory()) return request.continue();
    let body = fs.readFileSync(localFile);

    return request.respond({
      status: 200,
      contentType: contentTypeByPath(localFile) || contentTypeCache[localFile] || 'application/octet-stream',
      body,
      headers: {
        cached: true,
      }
    });
  };

  const responser = (response) => {
    const reqUrl = response.url();
    const uri = new URL(reqUrl);
    const localFile = cachePath(reqUrl);
    const headers = response.headers();
    const contentType = headers['content-type'];
    const isCached = headers['cached'] || false;
    const status = response.status();
    const method = response.request().method();

    if (method !== 'GET') return;
    if (status !== 200) return;
    if (uri.protocol === 'data:') return;
    if (isCached) return;

    if (contentTypeCache && contentType !== contentTypeCache[localFile]) {
      contentTypeCache[localFile] = contentType;
      if (dumpTimeout) clearTimeout(dumpTimeout);
      dumpTimeout = setTimeout(function () {
        dumpContentTypeCache(contentTypeCachePath, contentTypeCache);
      }, DUMP_TIMEOUT);
    }

    prepareParentDir(localFile);
    response.buffer().then(function (buffer) {
      fs.writeFileSync(localFile, buffer);
    }).catch(function (error) {
      console.log('REQUEST FAILED!!!');
      console.log(`${method} ${reqUrl} [${status}] ${contentType}\n${localFile}`);
      console.warn(error);
    });
  };

  page.on('request', requestor);
  page.on('response', responser);

  if (promise) {
    await promise();
    page.off('request', requestor);
    page.off('response', responser);
    if (dumpTimeout) clearTimeout(dumpTimeout);
    dumpContentTypeCache(contentTypeCachePath, contentTypeCache);
  }
}

module.exports = withLocalCache;
