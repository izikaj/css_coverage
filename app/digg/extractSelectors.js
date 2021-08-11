const url = require('url');
const css = require('css');
const cachedDownload = require('./cachedDownload')();

function selectorsFrom(rules) {
  const selectors = [];
  // parsed.stylesheet.rules
  for (const rule of rules) {
    if (rule.type === 'rule') {
      selectors.push(...rule.selectors)
    } else if (rule.rules !== undefined) {
      selectors.push(...selectorsFrom(rule.rules));
    }
  }
  return selectors;
}

function fetchRules(text) {
  const parsed = css.parse(text);
  const selectors = selectorsFrom(parsed.stylesheet.rules).map((s) => s.replace(/\s*\n\s*/gm, ' '));
  return [...new Set(selectors)].sort();
}

function extractSelectors(crawler, res) {
  const rootURI = res.options.uri;
  const origin = new url.URL(rootURI).origin;

  return new Promise(function (resolve, reject) {
    const $ = res.$;
    const inlines = [];

    $('style').each((_n, node) => {
      const style = $(node);
      inlines.push(style.text());
    });

    const externals = [];
    $('link[rel=stylesheet]').each((_n, node) => {
      const style = $(node);
      const href = style.attr('href');
      link = new url.URL(href, rootURI);
      const isCDN = /\.cloudfront\.net|\.amazonaws\.com/.test(link.origin);
      const isORIGIN = link.origin === origin;


      if (!(isORIGIN || isCDN)) {
        console.warn(`SKIP THIRD PARTY CSS: ${href} --- ${link.origin}/${origin}`);
        return;
      }

      externals.push(link);
    });

    Promise.all(externals.map((href) => cachedDownload(crawler, href))).then((externals) => {
      resolve(fetchRules([...inlines, ...externals].join("\n\n")));
    }).catch((err) => reject(err));
  });
}

module.exports = extractSelectors;
