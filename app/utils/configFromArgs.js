const fs = require('fs');
const parsedYaml = require('./parsedYaml');

function configFromArgs(window = [2]) {
  let config = {};
  process.argv.slice(...window).forEach((arg) => {
    try {
      if (!/\.ya?ml$/.test(arg)) {
        return;
      }

      if (!fs.existsSync(arg)) {
        return;
      }

      console.warn('config from ', arg);
      config = {
        ...config,
        ...parsedYaml(arg),
      };
    } catch (error) {
      //
    }
  });
  return config;
}

module.exports = configFromArgs;
