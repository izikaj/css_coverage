const { validate } = require('csstree-validator');

function isValidCSS(content) {
  if (!content || content.length === 0) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const errors = validate(content);
    if (errors.length > 0) {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!');
      console.log(' --- CSS-Tree ERROR ---');
      errors.forEach((err) => {
        console.log(`  ${err.message}!`)
        console.log(`    ${err.css}`)
        console.log(err.details)
        console.log('  ---------------');
      });
      console.log('!!!!!!!!!!!!!!!!!!!!!!!');
    }
    resolve(true);
  });
}

module.exports = isValidCSS;
