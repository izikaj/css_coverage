const path = require('path');
const codeName = require('./codeName');
const removeOffscreenElements = require('./removeOffscreenElements');
const refreshCSSCoverage = require('./refreshCSSCoverage');

async function getCSSCoverage({ page, link, device, origin, fullPage, loadTimeout }) {
  await page.emulate(device);
  const url = path.join(origin, link);
  console.log(`Visit: ${link} WITH ${device.name}`);
  const visit_type = codeName(link, device.name);

  await page.goto(url);
  if (!fullPage) {
    await removeOffscreenElements(page);
  }
  console.log(`PAGE: [${fullPage ? 'full' : 'short'}]${page.url()} - ${device.name}`);
  await page.waitFor(loadTimeout || 1);
  await page.coverage.startCSSCoverage({
    resetOnNavigation: true,
  });
  await page.screenshot({ path: `screens/${visit_type}.jpg`, fullPage: fullPage });
  let coverage = await page.coverage.stopCSSCoverage();

  if (!fullPage) {
    coverage = await refreshCSSCoverage({page, coverage});
  }

  return coverage.filter(src => {
    return (
      /\.cloudfront\.net/.test(src.url) ||
      /\/assets\//.test(src.url) ||
      src.url.startsWith(origin)
    );
  });
}

module.exports = getCSSCoverage;
