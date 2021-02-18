const url = require('url');

function urlsFromArgs(window = [2]) {
  return process.argv.slice(...window).map(l => {
    let link;
    if (!/https?:\/\//.test(l) && !/.+:\/\//.test(l)) {
      l = `https://${l}`
    }

    try {
      link = new url.URL(l);
    } catch (error) {
    }

    if (!link || ['http:', 'https:'].indexOf(link.protocol) == -1) {
      return;
    }

    return link.href;
  }).filter(l => l);
}

module.exports = urlsFromArgs;
