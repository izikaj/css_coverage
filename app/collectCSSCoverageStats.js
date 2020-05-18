// const fs = require('fs').promises;
// //
// const codeName = require('./utils/codeName');
// const makeHeatMap = require('./utils/makeHeatMap');
// const findBreakpoints = require('./utils/findBreakpoints');
// const rangesByHeatmap = require('./utils/rangesByHeatmap');
// const extractByRanges = require('./utils/extractByRanges');

const asyncForEach = require('./utils/asyncForEach');
const findMediaRanges = require('./utils/findMediaRanges');
const getCoverage = require('./utils/getCSSCoverage');

async function collectCSSCoverageStats({devices, links}) {
  let contents = {};
  let ranges = {};

  await asyncForEach(devices, async (device) => {
    await asyncForEach(links, async (link) => {
      const cov = await getCoverage({ page, device, origin, link });
      cov.forEach(src => {
        contents[src.url] = src.text
        ranges[src.url] = [
          ...(ranges[src.url] || []),
          ...src.ranges,
          ...findMediaRanges(src.text),
        ]
      });
    });
  });


  return Object.keys(ranges).map((src) => {
    return {
      src: src,
      content: contents[src],
      ranges: ranges[src],
    };
  });
}

module.exports = collectCSSCoverageStats;
