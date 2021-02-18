const fs = require('fs');
const YAML = require('yaml');

function parsedYaml(path) {
  const file = fs.readFileSync(path, 'utf8');
  return YAML.parse(file);
}

module.exports = parsedYaml;
