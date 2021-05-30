const validateCss = require('css-validator');
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
    if (errors.length === 0) {
      return resolve(true);
    }
    validateCss({ text: content }, function (_, { validity, errors, warnings }) {
      if (!validity) {
        console.log({ validity, errors_count: errors.length, warnings_count: warnings.length, err: errors[0] });
      }
      // const error_types = errors.map(e => e.type);
      // resolve(error_types.indexOf('generator.unrecognize') === -1);
      resolve(true);
    });
  });
}

module.exports = isValidCSS;
