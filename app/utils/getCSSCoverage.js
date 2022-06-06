const path = require('path');
const codeName = require('./codeName');
const removeOffscreenElements = require('./removeOffscreenElements');
const refreshCSSCoverage = require('./refreshCSSCoverage');
const withBlacklist = require('./withBlacklist');
const withLocalCache = require('./withLocalCache');
const waitForNetworkIdle = require('./waitForNetworkIdle');
const URL = require('url').URL;

async function getCSSCoverage({
  page,
  link,
  device,
  origin,
  fullPage,
}) {
  await page.emulate(device);
  const url = (new URL(link, origin)).toString()
  console.log(`Visit: ${link} WITH ${device.name}`);
  const visit_type = codeName(link, device.name);

  // await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  await withBlacklist(page, async function () {
    await withLocalCache(page, async function () {
      await page.goto(url);

      await page.waitForTimeout(100);
      await page.mouse.move(100, 100);
      await page.waitForTimeout(100);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
      await waitForNetworkIdle(page, 500, 0);

      if (!fullPage) await removeOffscreenElements(page);

      console.log(`PAGE: [${fullPage ? 'full' : 'short'}]${page.url()} - ${device.name}`);
      await page.waitForTimeout(100);
    });
  });
  await page.setRequestInterception(false);

  await page.coverage.startCSSCoverage();
  await page.screenshot({
    path: `screens/${visit_type}.jpg`,
    fullPage,
  });
  let coverage = await page.coverage.stopCSSCoverage();

  coverage = await refreshCSSCoverage({
    page,
    coverage,
    fullPage
  });

  return coverage.filter((src) => (
    /\.cloudfront\.net/.test(src.url) ||
    /\/assets\//.test(src.url) ||
    src.url.startsWith(origin)
  ));
}

module.exports = getCSSCoverage;
