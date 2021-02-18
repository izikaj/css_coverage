const LOST_POIN_COEF = 100;

function statsDiff(data1, data2) {
  const summary = {};
  let result = 0;
  [
    ...Object.keys(data1),
    ...Object.keys(data2),
  ].forEach((key) => {
    const cnt1 = (data1[key] && data1[key].count) || 0;
    const cnt2 = (data2[key] && data2[key].count) || 0;
    if (cnt1 === 0 || cnt2 === 0) {
      summary[key] = -1;
    } else {
      summary[key] = Math.abs(cnt1 - cnt2);
    }
  });
  Object.keys(summary).forEach((key) => {
    const weight = key.split('.').length;
    const sig = summary[key];
    if (sig === -1) {
      result += weight * LOST_POIN_COEF;
    } else {
      result += weight * sig;
    }
  });
  return result
}

module.exports = statsDiff;
