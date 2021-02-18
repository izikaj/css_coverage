const fs = require('fs').promises;
const path = require('path');

const asyncForEach = require('./utils/asyncForEach');
const codeName = require('./utils/codeName');
const padTo = require('./utils/padTo');

async function checkThisCSS({ devices, links, origin, page }) {
  const files = (
    await fs.readdir('dist')
  ).filter(file => /\.css/.test(file)).map(file => path.join('dist', file)).reverse();

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'stylesheet') {
      return req.abort();
    }
    // if (req.resourceType() === /(font|stylesheet|image|script|xhr|document)/) {
    // }

    req.continue();
  });

  // console.log('files', files);
  await asyncForEach(links, async (link) => {
    await asyncForEach(devices, async (device) => {
      await page.emulate(device);
      const url = path.join(origin, link);
      console.log(`Visit: ${link} WITH ${device.name}`);
      const visit_type = codeName(link, device.name);
      await page.goto(url);

      await asyncForEach(files, async (file) => {
        const step = parseInt(/_(\d+)\.css$/.exec(file)[1], 10);

        await page.addStyleTag({ path: file });
        await page.waitFor(100)
        await page.evaluate(() => {
          window.scrollBy(0, -99999999999);
        });
        await page.waitFor(100)
        await page.screenshot({ path: `screens/${visit_type}_critCSS_${padTo(step)}.jpg`, fullPage: false });
      });
    });
  });
  //
}

module.exports = checkThisCSS;
