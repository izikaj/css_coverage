const atob = require('atob');

function metaLookup($, path, stats = {}, computed = {}) {
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
