const CleanCSS = require('clean-css');

function normalizeCSS(content) {
  const minified = new CleanCSS({
    format: 'beautify'
  }).minify(content);

  console.log('minify:', minified.stats);

  return minified.styles;
}

module.exports = normalizeCSS;
