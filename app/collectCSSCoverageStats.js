const asyncForEach = require('./utils/asyncForEach');
const findNestedRuleRanges = require('./utils/findNestedRuleRanges');
const getCSSCoverage = require('./utils/getCSSCoverage');

async function collectCSSCoverageStats({ devices, links, origin, page, fullPage }) {
  let contents = {};
  let ranges = {};

  await asyncForEach(devices, async (device) => {
    await asyncForEach(links, async (link) => {
      const cov = await getCSSCoverage({ page, device, origin, link, fullPage });
      cov.forEach(src => {
        contents[src.url] = src.text;
        ranges[src.url] = [
          ...(ranges[src.url] || []),
          ...src.ranges,
          ...findNestedRuleRanges(src.text),
        ];
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
