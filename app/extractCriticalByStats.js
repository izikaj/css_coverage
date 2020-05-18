const fs = require('fs').promises;
//
const asyncForEach = require('./utils/asyncForEach');
const codeName = require('./utils/codeName');
const makeHeatMap = require('./utils/makeHeatMap');
const findBreakpoints = require('./utils/findBreakpoints');
const rangesByHeatmap = require('./utils/rangesByHeatmap');
const extractByRanges = require('./utils/extractByRanges');

async function extractCriticalByStats(data) {
  const namespace = codeName('crit', data.src);
  console.log(` ------- ${namespace} ------- `);
  console.log(`target: ${data.src}`);
  const hmap = makeHeatMap(data);
  const points = findBreakpoints(hmap);
  console.log(`breakpoints: ${[0, ...points]}`);

  await fs.writeFile(`dist/${namespace}_0.css`, data.content);
  await asyncForEach(points, async (min) => {
    const ranges = rangesByHeatmap(hmap, min);
    crit = extractByRanges(data.content, ranges);

    if (crit && crit.length > 0) {
      await fs.writeFile(`dist/${namespace}_${min}.css`, crit);
    }
  });
}

module.exports = extractCriticalByStats;
