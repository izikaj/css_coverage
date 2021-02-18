const fs = require('fs').promises;
//
const asyncForEach = require('./utils/asyncForEach');
const codeName = require('./utils/codeName');
const makeHeatMap = require('./utils/makeHeatMap');
const findBreakpoints = require('./utils/findBreakpoints');
const rangesByHeatmap = require('./utils/rangesByHeatmap');
const extractByRanges = require('./utils/extractByRanges');
const padTo = require('./utils/padTo');

const isValidCSS = require('./utils/isValidCSS');
const normalizeCSS = require('./utils/normalizeCSS');

async function extractCriticalByStats(data, params = {}) {
  const { maxPoints } = params;
  const namespace = codeName('crit', data.src);
  console.log(` ------- ${namespace} ------- `);
  console.log(`target: ${data.src}`);
  const hmap = makeHeatMap(data);
  const points = findBreakpoints(hmap);
  if (Number.isInteger(maxPoints) && maxPoints > 0 && points.length > maxPoints) {
    points.length = maxPoints;
  }
  console.log(`breakpoints: ${[0, ...points]}`);

  await fs.writeFile(`dist/${namespace}_${padTo(0)}.css`, data.content);
  await asyncForEach(points, async (min) => {
    const ranges = rangesByHeatmap(hmap, min);
    const criticalContent = extractByRanges(data.content, ranges);

    if (await isValidCSS(criticalContent)) {
      console.warn(`OK: HEAT POINT ${min} products valid CSS!`);
      console.log(`store step: ${min} of ${namespace}`);
      const normalized = normalizeCSS(criticalContent);

      if (normalized.length > 0) {
        await fs.writeFile(
          `dist/${namespace}_${padTo(min)}.css`,
          normalized,
        );
      }
    } else {
      console.warn(`BAD: HEAT POINT ${min} products invalid CSS!`);
    }
  });
}

module.exports = extractCriticalByStats;
