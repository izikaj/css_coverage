const fs = require('fs');
const parsedYaml = require('./parsedYaml');
const isFlag = require('./isFlag');

function configFromArgs(window = [2]) {
  let config = {};
  process.argv.slice(...window).forEach((arg) => {
    try {
      if (isFlag(arg) || !/\.(ya?ml|json)$/.test(arg) || !fs.existsSync(arg)) {
        return;
      }

      console.warn('config from ', arg);
      if (!/\.ya?ml$/.test(arg)) {
        config = {
          ...config,
          ...parsedYaml(arg),
        };
      } else {
        config = {
          ...config,
          ...parsedJson(arg),
        };
      }
    } catch (error) {
      //
    }
  });
  return config;
}

module.exports = configFromArgs;
