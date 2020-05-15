// for: chrome-79
const puppeteer = require('puppeteer-core');

// deps
const fs = require('fs').promises;

// const path = require('path');
// const beautify = require('beautify');
// const cleanCSS = require('clean-css');

// utils
const findMediaRanges = require('./utils/find_media_ranges');
const asyncForEach = require('./utils/async_for_each');
const cleanFolder = require('./utils/clean_folder');
// const waitForJQuery = require('./utils/wait_for_jquery');
// const removeOffscreen = require('./utils/remove_offscreen');
const authorize = require('./utils/authorize');
const getCoverage = require('./utils/get_coverage');

const origin = 'https://bestessay.education';
const credentials = {
  username: 'develop',
  password: 'trohim',
};
const macBookPro = {
  name: 'MacBook Pro 2015',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36',
  viewport: {
    width: 1440,
    height: 789,
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
    isLandscape: true
  }
};
const devices = [
  // desctop devices
  // macBookPro,
  // tablet devices
  // puppeteer.devices['iPad Mini'],
  // puppeteer.devices['iPad Pro'],
  // mobile devices
  puppeteer.devices['Galaxy Note 3'],
  puppeteer.devices['iPhone 4'],
  puppeteer.devices['iPhone X'],
];

let links = [
  '/account/orders/new',
  '/account/discounts',
  '/account/profile/edit',
  '/account/credits',
  '/account/feedbacks',
  '/account/referrals',
];

(async () => {
  await cleanFolder('./dist');
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


  let contents = {};
  let ranges = {};

  await asyncForEach(devices, async (device) => {
    await asyncForEach(links, async (link) => {
      const cov = await getCoverage({page, device, origin, link});
      cov.forEach(src => {
        contents[src.url] = src.text
        ranges[src.url] = [
          ...(ranges[src.url] || []),
          ...src.ranges,
          ...findMediaRanges(src.text),
        ]
      });
    });
  });

  const raw = Object.keys(ranges).map((src) => {
    return {
      src: src,
      content: contents[src],
      ranges: ranges[src],
    };
  });
  await fs.writeFile(`dist/dump.json`, JSON.stringify(raw));

  await browser.close();
})();
