const SEP = '$';

function makeHeatMap(src) {
  const amount = src.ranges.length;
  const step = amount > 1000 ? Math.floor(amount * 0.1) : 0;
  const map = new Array(src.content.length).join(SEP).split(SEP).map(() => 0);

  src.ranges.forEach((range, cursor) => {
    if (step > 0 && cursor % step === 0) {
      console.log(`work progess ${cursor}/${amount}`);
    }
    let pointer = range.start;
    while (pointer <= range.end) {
      map[pointer++]++;
    }
  });

  return map;
}

module.exports = makeHeatMap;
