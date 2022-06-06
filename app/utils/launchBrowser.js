const puppeteer = require('puppeteer-core');
const flagsFromArgs = require('./flagsFromArgs');

const flags = flagsFromArgs();
const isHeadless = !(flags.noHeadless || flags.notHeadless);
const browserApp = (
  flags.browserApp || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
)

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: isHeadless,
    executablePath: browserApp,
    // devtools: true,
  });
  return browser;
}

module.exports = launchBrowser;
