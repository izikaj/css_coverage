// utils
const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;

// utils
const cleanFolder = require('./app/utils/cleanFolder');
const asyncForEach = require('./app/utils/asyncForEach');
const authorize = require('./app/utils/authorize');
const devicesList = require('./app/devicesList');
const checkThisCSS = require('./app/checkThisCSS');

const extractCriticalByStats = require('./app/extractCriticalByStats');
const collectCSSCoverageStats = require('./app/collectCSSCoverageStats');

// const origin = 'https://bestessay.education';
const origin = 'https://alltopreviews.com';

const credentials = {
  username: 'develop',
  password: 'trohim',
};

const devices = [
  devicesList.macBookPro,
  devicesList.iPhoneX,
];

let links = [
  '/',
  '/best-wordpress-plugins-for-content',
  '/blog',
];

(async () => {
  await cleanFolder('./screens', (name) => /_critCSS_\d+/.test(name));

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

    await page.goto(origin);
    await authorize(page);
  }
  console.log('Start crawling...');

  // const raw = await collectCSSCoverageStats({ devices, links, origin, page });

  await checkThisCSS({ origin, links, devices, page });

  console.log('Crawling finished!');

  await browser.close();
})();
