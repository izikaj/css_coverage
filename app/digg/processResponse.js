const url = require('url');
const metaLookup = require('./metaLookup');
const collectPageStats = require('./collectPageStats');
const statsDiff = require('./statsDiff');
const fs = require('fs');

const MAX_PAGE = 2;

function processResponse({ crawler, origin, computed, stats, visited, debugs, found, codename }) {
  return (res) => {
    const $ = res.$;
    const rootUrl = res.request.uri.href;
    const path = res.request.uri.path;
    let link, relLink;

    if (visited.indexOf(path) !== -1) {
      return
    }
    visited.push(path);
    console.log(`[${crawler.queueSize}]${visited.length}/${found.length} --- ${path}`);

    metaLookup($, path, stats, computed);

    $('a').each((_n, linkTag) => {
      relLink = $(linkTag).attr('href');
      if (!relLink || relLink.length === 0 || relLink === '#') {
        return;
      }
      link = new url.URL(relLink, rootUrl);
      if (link.origin != origin) {
        return;
      }
      if ((visited.indexOf(link.pathname) !== -1) || (found.indexOf(link.pathname) !== -1)) {
        return;
      }
      found.push(link.pathname);
      if (/\/p\/\d+/.test(link.pathname)) {
        const page = parseInt(/\/p\/(\d+)/.exec(link.pathname)[1], 10);
        if (page && page > MAX_PAGE) {
          return;
        }
      }
      crawler.queue(new url.URL(link.pathname, rootUrl).href);
    });

    const pStats = collectPageStats($);
    const limit = statsDiff({}, pStats);
    debugs[path] = {
      stats: pStats,
      limit,
    };
    const resultData = { origin, computed, stats, visited, debugs }
    fs.writeFileSync(`dist/digger-${codename}.json`, JSON.stringify(resultData, null, '  '));
  }
}

module.exports = processResponse;
