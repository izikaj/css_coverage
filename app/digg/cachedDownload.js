function cachedDownload() {
  const cache = {};
  return function (crawler, href) {
    return new Promise(function (resolve, reject) {
      const cached = cache[href];
      if (cached !== undefined) {
        return resolve(cached);
      }

      crawler.direct({
        uri: href,
        jQuery: false,
        callback: function (error, response) {
          if (error) {
            reject(error);
          } else {
            cache[href] = response.body;
            resolve(response.body);
          }
        }
      });
    });
  }
};

module.exports = cachedDownload;
