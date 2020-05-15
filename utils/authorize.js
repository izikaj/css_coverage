const waitForJQuery = require('./wait_for_jquery');

async function authorize(page) {
  const credentials = { email: '123@mailinator.com', password: '123123123' };
  await waitForJQuery(page);
  await page.waitFor(1000);
  await page.evaluate(() => {
    const loginBtn = "//a[contains(text(), 'Log in')]";
    const result = document.evaluate(loginBtn, document, null, XPathResult.ANY_TYPE, null);

    const target = result.iterateNext();
    if (target) {
      target.click();
    }
  });
  await page.waitFor(1000);
  console.log(`insert email: ${credentials.email}`);
  await page.type('[type=email], #account_email', credentials.email);
  console.log(`insert password: ${credentials.password}`);
  await page.type('[type=password], #account_password', credentials.password);
  await page.$eval('form, #new_account', form => form.submit());
  await page.waitFor(1000);
  await waitForJQuery(page);
}

module.exports = authorize;
