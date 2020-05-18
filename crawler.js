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
const origin = 'https://alltopreviews.com';

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
  '/best-wordpress-plugins-for-content',
  '/blog',
  '/blog/are-essay-writing-services-safe-lets-take-a-closer-look',
  '/blog/what-is-a-phd',
  '/can-you-plagiarize-your-own-work',
  '/compare',
  '/discounts',
  '/policy',
  '/services',
  '/services/bestessays',
  '/services/edubirdie',
  '/terms',
  '/tips',
  '/tips/great-definition-essay-topic-prompts',
  '/tips/how-to-write-a-thesis-proposal',
  '/what-we-do',
  '/writing-contest',

  // '/account/orders/new',
  // '/account/discounts',
  // '/account/profile/edit',
  // '/account/credits',
  // '/account/feedbacks',
  // '/account/referrals',
];

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

    await page.goto(origin);
    await authorize(page);
  }
  console.log('Start crawling...');

  const raw = await collectCSSCoverageStats({ devices, links, origin, page });

  console.log('Crawling finished!');

  await browser.close();
  await fs.writeFile(`dist/dump.json`, JSON.stringify(raw));

  console.log('Start stats counting...');

  await asyncForEach(raw, async (data) => {
    await extractCriticalByStats(data);
  });
})();
