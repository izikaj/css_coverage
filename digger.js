const url = require('url');
const fs = require('fs');
const Crawler = require('crawler');

const codeName = require('./app/utils/codeName');
const urlsFromArgs = require('./app/utils/urlsFromArgs');
const findSimilarByStats = require('./app/digg/findSimilarByStats');
const cleanComputed = require('./app/digg/cleanComputed');
const makeMinimalizedCommon = require('./app/digg/makeMinimalizedCommon');
const customGroups = require('./app/digg/customGroups');
const extractSelectors = require('./app/digg/extractSelectors');

const roots = urlsFromArgs();
console.warn(roots);

const walker = (root) => {
  const rootURI = new url.URL(root);
  const origin = rootURI.origin;
  const codename = codeName(origin);
  const visited = [];
  const found = [];
  const stats = [];
  const computed = {};
  const debugs = {};
  const similar = [];
  const errors = [];

  console.warn(`Dig ${origin} ...`)

  const crawler = new Crawler({
    maxConnections: 5,
    rateLimit: 200,
    auth: {
      user: 'develop',
      pass: 'trohim',
      sendImmediately: true
    },
    // This will be called for each crawled page
    callback: function (error, res, done) {
      extractSelectors(crawler, res).then(function(selectors) {
        console.warn(`SELECTORS: ${selectors.length}`, selectors.slice(0, 10));
      });

      // if (visited.length > 2) {
      //   console.warn('STOP FOR NOW!!!!');
      //   process.exit(0);
      // }

      if (error || (res && res.statusCode >= 400)) {
        console.warn('');
        console.warn('   !!!!!!!!!!!!!!!!!!!!!!   ');
        console.warn(res && res.statusCode, error);
        console.warn('   !!!!!!!!!!!!!!!!!!!!!!   ');
        console.warn('');
        errors.push({
          error,
          res
        });
      } else {
        processResponse(res);
      }
      done();
    }
  });

  const processResponse = require('./app/digg/processResponse')({
    origin, computed, stats, visited, debugs, found, codename, crawler,
  });

  crawler.queue(origin);
  crawler.on('drain', function () {
    findSimilarByStats({
      similar, debugs,
    });
    if (Object.keys(computed).length === 0) {
      customGroups({ similar, computed });
    }
    cleanComputed({ stats, computed });

    const minimal = makeMinimalizedCommon({ similar, computed });

    const resultData = { origin, minimal, similar, computed, stats, visited, debugs, errors };
    fs.writeFileSync(`dist/digger-${codename}.json`, JSON.stringify(resultData, null, '  '));

    console.warn(`COMPLETED ${origin} !`);
  });
}

roots.forEach(walker);
