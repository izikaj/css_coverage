// deps
const fs = require('fs').promises;

// const beautify = require('beautify');
// const cleanCSS = require('clean-css');

// utils
const asyncForEach = require('./app/utils/asyncForEach');
const cleanFolder = require('./app/utils/cleanFolder');
const extractCriticalByStats = require('./app/extractCriticalByStats');

(async () => {
  console.log('Start stats counting...');

  await cleanFolder('./dist', (name) => /crit_/.test(name));

  const dump = JSON.parse(await fs.readFile (`dist/dump.json`));
  await asyncForEach(dump, async (data) => {
    await extractCriticalByStats(data);
  });
})();
