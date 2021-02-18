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
      console.log('!!!!!!!!!!!!!!!!!!!!!!!');
      console.log(' --- CSS-Tree ERROR ---');
      errors.forEach((err) => {
        console.log(`  ${err.message}!`)
        console.log(`    ${err.css}`)
        console.log(err.details)
        console.log('  ---------------');
      });
      console.log('!!!!!!!!!!!!!!!!!!!!!!!');
      console.log('!!!!!!!!!!!!!!!!!!!!!!!');
    }
    // resolve(errors.length <= 0);
    validateCss({ text: content }, function (_, { validity, errors, warnings }) {
      if (!validity) {
        console.log({ validity, errors_count: errors.length, err: errors[0], warnings_count: warnings.length });
        // console.warn(errors);
      }
      const error_types = errors.map(e => e.type);

      resolve(error_types.indexOf('generator.unrecognize') === -1);
    });
  });
}

module.exports = isValidCSS;
