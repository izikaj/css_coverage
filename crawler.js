const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const YAML = require('yaml');

// utils
const cleanFolder = require('./app/utils/cleanFolder');
const asyncForEach = require('./app/utils/asyncForEach');
const authorize = require('./app/utils/authorize');
const devicesList = require('./app/devicesList');

const extractCriticalByStats = require('./app/extractCriticalByStats');
const collectCSSCoverageStats = require('./app/collectCSSCoverageStats');
const urlsFromArgs = require('./app/utils/urlsFromArgs');
const parsedYaml = require('./app/utils/parsedYaml');
const configFromArgs = require('./app/utils/configFromArgs');
const origin = urlsFromArgs([2, 3])[0];

if (!origin) { console.error('No origin provided!'); }
console.warn('Crawl site: ', origin);

const CONFIG = {
  credentials: parsedYaml('credentials.yml'),
  links: parsedYaml('links.yml').links,
  ...configFromArgs([3]),
}

const credentials = {...CONFIG.credentials.basic};

const devices = [
  ...devicesList.desktop,
  ...devicesList.tablet,
  ...devicesList.mobile,
];

let links = [...CONFIG.links];

const fullPage = false;
const loadTimeout = 1000;
const maxPoints = 2;

(async () => {
  await cleanFolder('./dist', (name) => /crit_/.test(name));
  await cleanFolder('./screens');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(true);
  await page.emulateMediaType('screen');
  await page.authenticate(credentials);

  if (links.filter(p => /^\/account\//.test(p)).length > 0) {
    console.log('Account namespace detected, authorization required!');

    // await page.goto(origin);
    await page.goto(`${origin}${links.filter(p => /^\/account\//.test(p))[0]}`);
    await authorize(page);
  }
  console.log('Start crawling...');

  const raw = await collectCSSCoverageStats({ devices, links, origin, page, fullPage, loadTimeout });

  console.log('Crawling finished!');

  await browser.close();
  await fs.writeFile(`dist/dump.json`, JSON.stringify(raw));

  console.log('Start stats counting...');

  await asyncForEach(raw, async (data) => {
    await extractCriticalByStats(data, { maxPoints });
  });
})();
