const fs = require('fs');

function parsedJson(path) {
  const file = fs.readFileSync(path, 'utf8');
  return JSON.parse(file);
}

module.exports = parsedJson;
