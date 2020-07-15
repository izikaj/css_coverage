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
// const origin = 'https://ratedbystudents.com';
// const origin = 'https://topwritingreviews.com/';
// const origin = 'http://topessaywriting.writershub.org';
// const origin = 'https://alltopreviews.com/';
const origin = 'https://essayguard.com/';


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
  // '/',

  // '/about',
  // '/all-the-truth-about-online-plagiarism-check-software',
  // '/awards',
  // '/contacts',
  // '/cookie-policy-text',
  // '/how-to-cheat-plagiarism-detection-software',
  // '/how-to-find',
  // '/how-to-find-an-online-dissertation-writing-service',
  // '/how-to-find-the-perfect-custom-thesis-writing-service',
  // '/how-to-get-thesis-writing-assistance',
  // '/learn-how-to-stay-focused',
  // '/policy',
  // '/proofreading-tools',
  // '/research-essay-topics-to-engage-and-impress',
  // '/secrets-of-the-best-essay-writing-services',
  // '/terms',
  // '/writing-the-dissertation-proposal',

  // '/blog',
  // '/blog/p/2',
  // '/blog/how-many-words-is-a-5-page-paper',
  // '/blog/pokemon-go-the-most-trendy-app-in-2016',

  // '/services',
  // '/services/p/2',
  // '/services/edubirdie',
  // '/services/essaythinker',
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
