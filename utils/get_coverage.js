const path = require('path');
const codeName = require('./code_name');
const removeOffscreen = require('./remove_offscreen');

async function getCoverage({ page, link, device, origin, relative }) {
  await page.emulate(device);
  const url = path.join(origin, link);
  console.log(`Visit: ${link} WITH ${device.name}`);
  const visit_type = codeName(relative, device.name);

  await page.goto(url);
  await removeOffscreen(page);
  await page.screenshot({ path: `screens/${visit_type}.jpg`, fullPage: false });

  await page.coverage.startCSSCoverage({
    resetOnNavigation: true,
  });

  const coverage = await page.coverage.stopCSSCoverage();

  return coverage.filter(src => {
    return (
      /\.cloudfront\.net/.test(src.url) ||
      src.url.startsWith(origin)
    );
  });
}

module.exports = getCoverage;
