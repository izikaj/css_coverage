const atob = require('atob');

const LOST_POIN_COEF = 100;

function metaLookup($, path, stats = {}, computed = {}) {
  // extract meta[name=critical-css-debug]
  const meta = $('meta[name=critical-css-debug]').attr('content');
  if (meta && meta.length > 0) {
    const data = JSON.parse(atob(meta));
    const { lookup, found } = data;
    stats.push({
      path,
      lookup,
      found,
    });
    lookup.forEach(look => {
      computed[look] = {
        count: ((computed[look] && computed[look].count) || 0) + 1,
        paths: [
          ...((computed[look] && computed[look].paths) || []),
          path
        ],
      };
    })
  }
}

module.exports = metaLookup;
