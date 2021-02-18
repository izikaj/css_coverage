const REGEX = /1+/g;

function rangesByHeatmap(hmap, rate = 1) {
  const mask = hmap.map(v => v >= rate ? 1 : 0).join('');
  const ranges = [];
  let match;

  while (match = REGEX.exec(mask)) {
    ranges.push({
      start: match.index,
      end: match.index + match[0].length - 1
    });
  }

  return ranges;
}

module.exports = rangesByHeatmap;
