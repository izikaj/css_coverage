const fs = require('fs');
const path = require('path');
// const fs = require('fs').promises;
const rimraf = require('rimraf');

// utils
const authorize = require('./app/utils/authorize');
const devicesList = require('./app/devicesList');
const codeName = require('./app/utils/codeName');

const extractCritical = require('./app/extractCritical');
const collectCSSCoverageStats = require('./app/collectCSSCoverageStats');
const flagsFromArgs = require('./app/utils/flagsFromArgs');
const parsedYaml = require('./app/utils/parsedYaml');
const configFromArgs = require('./app/utils/configFromArgs');
const normalizeCSS = require('./app/utils/normalizeCSS');
const launchBrowser = require('./app/utils/launchBrowser');

const flags = flagsFromArgs();

const CONFIG = {
  credentials: parsedYaml('credentials.yml'),
  ...configFromArgs([2, 3]),
  flags: {
    clean: (flags.clean || false),
    continue: !flags.clean && (flags.continue || flags.C) !== 'false',
  },
}

const origin = CONFIG.origin;
const codename = codeName(origin);

if (!origin) { console.error('No origin provided!'); }
console.warn('Process origin: ', origin);

const credentials = { ...CONFIG.credentials.basic };

const devices = [
  ...devicesList.desktop,
  ...devicesList.tablet,
  ...devicesList.mobile,
];
const fullPage = false;
const loadTimeout = 3000;
const maxPoints = 5;

async function pageForLinks(browser, links = []) {
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(true);
  await page.emulateMediaType('screen');
  await page.authenticate(credentials);

  if (links.filter(p => /^\/account\//.test(p)).length > 0) {
    console.log('Account namespace detected, authorization required!');

    await page.goto(`${origin}${links.filter(p => /^\/account\//.test(p))[0]}`);
    await authorize(page);
  }

  return page;
}

async function getDataIfNeed({ browser, links, target, pwd }) {
  try {
    if (fs.existsSync(`${pwd}/dump.json`)) {
      console.log(`Get crawled data from dump!`);
      return JSON.parse(fs.readFileSync(`${pwd}/dump.json`));
    }
    console.log(`Start crawling ${target}...`);
    const page = await pageForLinks(browser, links);

    const raw = await collectCSSCoverageStats({ devices, links, origin, page, fullPage, loadTimeout });
    console.log(`Crawling finished for ${target}`);

    fs.writeFileSync(`${pwd}/dump.json`, JSON.stringify(raw));
    return raw;
  } catch (error) {
    console.error('Fetch coverage data error', error);
    return [];
  }
}

async function makeTarget({ target, browser }) {
  const links = CONFIG.minimal[target].paths;
  const kind = target.replace(/^critical\//, '').replace(/\.css$/, '')
  const finalPath = `./dist/${codename}/${target}`;
  const pwd = `./dist/${codename}/__${kind}/`;

  console.log(`Making ${target}... [pwd: ${pwd}]`);
  if (CONFIG.flags.clean) {
    rimraf.sync(pwd);
  }
  fs.mkdirSync(pwd, { recursive: true });

  const raw = await getDataIfNeed({ browser, links, target, pwd });

  console.log('Start stats counting...');
  const parts = [];
  for (const data of raw) {
    if (!/\.css($|\?)/.test(data.src)) {
      continue;
    }
    const css = await extractCritical({ origin, data, maxPoints, pwd });
    if (css && css.trim().length > 0) {
      parts.push(css.trim());
    }
  }

  fs.mkdirSync(path.dirname(finalPath), { recursive: true });
  const result = normalizeCSS(parts.join('\n\n'), true);
  fs.writeFileSync(finalPath, result);
}

(async () => {
  if (typeof CONFIG.minimal === 'undefined') {
    throw 'No critical data found!';
  }
  const browser = await launchBrowser();
  for (const target in CONFIG.minimal) {
    await makeTarget({ target, browser });
  }
  await browser.close();

})().then(() => {
  console.log('All is OK');
}).catch((error) => {
  console.error('Error Occured', error);
  process.exit(1);
});
