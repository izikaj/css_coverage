const url = require('url');
const fs = require('fs');
const rimraf = require('rimraf');
const Crawler = require('crawler');

const codeName = require('./app/utils/codeName');
const urlsFromArgs = require('./app/utils/urlsFromArgs');
const launchBrowser = require('./app/utils/launchBrowser');
const parsedYaml = require('./app/utils/parsedYaml');

const roots = urlsFromArgs();
console.warn(roots);
const { basic: credentials } = parsedYaml('credentials.yml');

const MAX_COUNT = 100;
const MAX_PAGE = 2;

const walker = (root, { browser }) => {
  const rootURI = new url.URL(root);
  const origin = rootURI.origin;
  const codename = codeName(origin);
  const visited = [];
  const found = [];
  const errors = [];
  let rejector, page;
  const crawler = new Crawler({
    maxConnections: 5,
    rateLimit: 200,
    auth: {
      user: credentials.username,
      pass: credentials.password,
      sendImmediately: true
    },
    callback: digCallback,
  });

  async function makePage() {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true);
    await page.emulateMediaType('screen');
    await page.authenticate(credentials);
    await page.setViewport({
      width: 1200,
      height: 800
    });
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      console.log(`>>> ${type}: ${text}`);
    });

    return page;
  }

  async function prepareScreenDir() {
    rimraf.sync(`screens/${codename}`);
    fs.mkdirSync(`screens/${codename}`, { recursive: true });
  }

  function queueAllLinks(res) {
    try {

      const $ = res.$;
      const rootUrl = res.request.uri.href;

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
          const pageNum = parseInt(/\/p\/(\d+)/.exec(link.pathname)[1], 10);
          if (pageNum && pageNum > MAX_PAGE) {
            return;
          }
        }

        crawler.queue(new url.URL(link.pathname, rootUrl).href);
      });
    } catch (error) {
      console.log('queueAllLinks ERROR', res.request.uri.href, error);
    }
  }

  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            window.scrollTo(0, 0);
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async function inspectPage(res) {
    const rootUrl = res.request.uri.href;
    const path = res.request.uri.path;
    const pageCode = codeName(path);
    const pageName = pageCode.length > 0 ? pageCode : 'index';

    // console.log(' *** VISIT', rootUrl);
    await page.goto(rootUrl);
    // await page.click('.text_logo');
    await page.waitFor(1000);
    await autoScroll(page);
    await page.screenshot({ path: `screens/${codename}/${pageName}.jpg`, fullPage: true });
    // console.log(' *** VISIT DONE', rootUrl);
  }

  function digCallback(error, res, done) {
    const path = res.request.uri.path;

    if (visited.length >= MAX_COUNT) {
      const msg = 'MAX_COUNT limit reached!';
      // console.warn(msg);
      if (typeof rejector !== 'undefined') {
        rejector(msg);
        return done();
      }
      throw msg;
    }

    if (visited.indexOf(path) !== -1) {
      return done();
    }
    visited.push(path);

    if (error || (res && res.statusCode >= 400)) {
      console.warn('');
      console.warn('   !!!!!!!!!!!!!!!!!!!!!!   ');
      console.warn(path, res && res.statusCode, error);
      console.warn('   !!!!!!!!!!!!!!!!!!!!!!   ');
      console.warn('');
      errors.push({ error, res });
      return done();
    }

    queueAllLinks(res);
    inspectPage(res).then(done).catch(done);
  }

  async function crawl() {
    page = await makePage();
    await prepareScreenDir();

    console.warn(`Dig ${origin} ...`);
    crawler.queue(origin);

    return new Promise((resolve, reject) => {
      rejector = reject;
      crawler.on('drain', function () {
        console.warn(`COMPLETED ${origin} !`);
        setTimeout(() => {
          console.warn(`FINISH ${origin} !`);
          page.close().then(() => {
            resolve('OK');
          });
        }, 10000);
      });
    });
  }

  return crawl();
}

(async () => {
  const browser = await launchBrowser();
  for (const root of roots) {
    try {
      await walker(root, { browser });
    } catch (error) {
      console.error('Error:', error);
      break;
    }
  }
  await browser.close();

})().then(() => {
  console.log('All is OK');
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
