async function waitForJQuery(page) {
  const startedAt = new Date();
  let withJQ;
  while (true) {
    withJQ = await page.evaluate(_ => typeof (jQuery) === 'function');
    curr = new Date();
    if (withJQ) {
      console.log(`jQuery detected in ${curr - startedAt}`);
      return true;
    }

    if ((curr - startedAt) > 10000) {
      console.log('WARN: jQuery wait timeout');
      return false;
    }

    await page.mouse.move(100, 100);
    await page.waitFor(200);
  }
}

module.exports = waitForJQuery;
