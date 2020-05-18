const validateCss = require('css-validator');

function isValidCSS(content) {
  if (!content || content.length === 0) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    validateCss({ text: content }, function (_, { validity, errors, warnings }) {
      if (!validity) {
        console.log({ validity, errors_count: errors.length, warnings_count: warnings.length });
      }
      const error_types = errors.map(e => e.type);

      resolve(error_types.indexOf('generator.unrecognize') === -1);
    });
  });
}

module.exports = isValidCSS;
