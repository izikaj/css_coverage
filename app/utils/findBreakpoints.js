const SEP = '$';

function findMaxValue(hmap) {
  let max = 0;
  hmap.forEach(n => max = n > max ? n : max)
  return max
}

function findBreakpoints(hmap) {
  const max = findMaxValue(hmap);
  const steps = [];
  let prev = hmap.length;

  new Array(max).join(SEP).split(SEP).map((_, i) => i + 1).forEach(min => {
    const count = hmap.filter(n => n >= (min + 1)).length;
    if (count >= prev) { return; }

    prev = count;
    steps.push((min + 1));
  });

  return steps;
}

module.exports = findBreakpoints;
