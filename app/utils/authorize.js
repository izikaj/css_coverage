const waitForJQuery = require('./waitForJQuery');
const parsedYaml = require('./parsedYaml');

async function authorize(page) {
  const credentials = parsedYaml('credentials.yml').user[0];
  await waitForJQuery(page);
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    // const loginBtn = "//a[contains(text(), 'Log in')]";
    const loginBtn = "//a[contains(text(), 'Log in') or contains(text(), 'Log In')]";
    const result = document.evaluate(loginBtn, document, null, XPathResult.ANY_TYPE, null);

    const target = result.iterateNext();
    if (target) {
      target.click();
    }
  });
  console.log(`WTF: ${page.url()}`);
  await page.waitForTimeout(1000);
  console.log(`insert email: ${credentials.email}`);
  await page.type('[type=email], [name="account[email]"], #account_email', `${credentials.email}`.split(''));
  console.log(`insert password: ${credentials.password}`);
  await page.type('[type=password], [name="account[password]"], #account_password', `${credentials.password}`.split(''));
  await Promise.all([
    page.$eval('#new_account, form', form => form.submit()),
    page.waitForNavigation(),
  ]);
  await page.waitForTimeout(1000);
  await waitForJQuery(page);
}

module.exports = authorize;
