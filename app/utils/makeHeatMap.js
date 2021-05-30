const SEP = '$';

const makeBlankMap = (size, value = 0) => {
  const result = [];
  for (let i = 0; i < size; i++) {
    result[i] = value;
  }
  return result;
}

function makeHeatMap(src) {
  const amount = src.ranges.length;
  const step = amount > 5000 ? Math.floor(amount * 0.1) : 0;
  const map = makeBlankMap(src.content.length);

  for (let cursor = 0; cursor < src.ranges.length; cursor++) {
    const range = src.ranges[cursor];
    if (step > 0 && cursor % step === 0) {
      console.log(`work progess ${cursor}/${amount}`);
    }
    for (let pt = range.start; pt < range.end; pt++) {
      map[pt]++;
    }
  }

  return map;
}

module.exports = makeHeatMap;
