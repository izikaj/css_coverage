const url = require('url');
const BLACKLIST = [
  'botsrv.com',
  'botsrv2.com',
  'media.botsrv2.com',
  'static.botsrv2.com',
  'images.dmca.com',
  'www.google-analytics.com',
  'www.googletagmanager.com',
  '2-vbus-eu.ladesk.com',
  'servicechatforus.ladesk.com',
];

const isBlocked = (link) => {
  const uri = new url.URL(link);
  return BLACKLIST.indexOf(uri.hostname) !== -1;
}

const requestor = (request) => {
  if (isBlocked(request.url())) return request.abort();
}

async function withBlacklist(page, promise) {
  page.on('request', requestor);

  if (promise) {
    await promise();
    page.off('request', requestor);
  }
}

module.exports = withBlacklist;
