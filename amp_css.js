const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;

// utils
const cleanFolder = require('./app/utils/cleanFolder');
const asyncForEach = require('./app/utils/asyncForEach');
const authorize = require('./app/utils/authorize');
const devicesList = require('./app/devicesList');

const extractCriticalByStats = require('./app/extractCriticalByStats');
const collectCSSCoverageStats = require('./app/collectCSSCoverageStats');

// const origin = 'https://bestessay.education';
// const origin = 'https://alltopreviews.com';
// const origin = 'https://essayguard.com';
const origin = 'https://topwritingreviews.com/';
// const origin = 'https://ratedbystudents.com/';

const credentials = {
  username: 'develop',
  password: 'trohim',
};

const devices = [
  ...devicesList.desktop,
  ...devicesList.tablet,
  ...devicesList.mobile,
];

let links = [
  '/',
  // '/services',
  // '/services/p/2',
  // '/services/p/7',
  // '/services?sort=delivery',
  // '/services?category_id=1',
];

(async () => {
  await cleanFolder('./dist', (name) => /crit_/.test(name));
  await cleanFolder('./screens');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(false);
  await page.emulateMediaType('screen');
  await page.authenticate(credentials);

  if (links.filter(p => /^\/account\//.test(p)).length > 0) {
    console.log('Account namespace detected, authorization required!');

    await page.goto(origin);
    await authorize(page);
  }
  console.log('Start crawling...');

  const raw = await collectCSSCoverageStats({
    devices,
    links,
    origin,
    page,
    fullPage: true,
  });

  console.log('Crawling finished!');

  await browser.close();
  await fs.writeFile(`dist/dump.json`, JSON.stringify(raw));

  console.log('Start stats counting...');

  await asyncForEach(raw, async (data) => {
    await extractCriticalByStats(data);
  });
})();
