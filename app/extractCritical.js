const fs = require('fs').promises;
const url = require('url');
//
const asyncForEach = require('./utils/asyncForEach');
const codeName = require('./utils/codeName');
const makeHeatMap = require('./utils/makeHeatMap');
const findBreakpoints = require('./utils/findBreakpoints');
const rangesByHeatmap = require('./utils/rangesByHeatmap');
const extractByRanges = require('./utils/extractByRanges');
const extractByHeatmap = require('./utils/extractByHeatmap');
const padTo = require('./utils/padTo');

const isValidCSS = require('./utils/isValidCSS');
const normalizeCSS = require('./utils/normalizeCSS');
const debugHeatmap = require('./utils/debugHeatmap');

async function extractCritical({ origin, data, maxPoints, pwd }) {
  const uri = new url.URL(data.src, origin);
  const namespace = codeName(uri.pathname);
  const hmap = makeHeatMap(data);

  await debugHeatmap({ content: data.content, hmap, pwd, namespace });
  await fs.writeFile(`${pwd || 'dist'}/${namespace}_${padTo(0)}.css`, data.content);

  const points = findBreakpoints(hmap);
  if (Number.isInteger(maxPoints) && maxPoints > 0 && points.length > maxPoints) {
    points.length = maxPoints;
  }
  console.log(`breakpoints: ${[0, ...points]}`);

  for (const min of points) {
    const ranges = rangesByHeatmap(hmap, min);
    const ddhmap = makeHeatMap({ ranges, content: data.content });
    await debugHeatmap({ content: data.content, hmap: ddhmap, pwd, namespace, suffix: `${min}` });

    // const criticalContent = extractByRanges(data.content, ranges);
    const criticalContent = extractByHeatmap(data.content, hmap, min);

    await fs.writeFile(
      `${pwd}/_${namespace}_${padTo(min)}.css`,
      criticalContent,
    );
    if (await isValidCSS(criticalContent)) {
      console.warn(`OK: HEAT POINT ${min} products valid CSS!`);
      console.log(`store step: ${min} of ${namespace}`);
      const normalized = normalizeCSS(criticalContent);

      if (normalized.length > 0) {
        await fs.writeFile(
          `${pwd || 'dist'}/${namespace}_${padTo(min)}.css`,
          normalized,
        );
      }
      return normalized;
    } else {
      console.warn(`BAD: HEAT POINT ${min} products invalid CSS!`);
    }
  }
  return '';
}

module.exports = extractCritical;
