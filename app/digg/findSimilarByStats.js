const statsDiff = require('./statsDiff');

const DIFF_LIMIT_COEF = 0.1;

function findSimilarByStats({ debugs, similar }) {
  Object.keys(debugs).forEach((pth1) => {
    let injected = false;

    Object.keys(debugs).forEach((pth2) => {
      if (pth1 == pth2) {
        return;
      }

      const dist = statsDiff(debugs[pth1].stats, debugs[pth2].stats);
      const l1 = debugs[pth1].limit;
      const l2 = debugs[pth2].limit;

      if (dist > (l1 * DIFF_LIMIT_COEF) || dist > (l2 * DIFF_LIMIT_COEF)) {
        return;
      }

      injected = false;
      similar.forEach(ss => {
        if ((ss.indexOf(pth1) == -1) && (ss.indexOf(pth2) == -1)) {
          return;
        }
        // if found
        if (ss.indexOf(pth1) == -1) { ss.push(pth1); }
        if (ss.indexOf(pth2) == -1) { ss.push(pth2); }
        injected = true;
      })
      if (!injected) {
        similar.push([pth1, pth2]);
      }

      debugs[pth1].diffs = debugs[pth1].diffs || {}
      debugs[pth1].diffs[pth2] = dist;
      debugs[pth2].diffs = debugs[pth2].diffs || {}
      debugs[pth2].diffs[pth1] = dist;
    });

    injected = false;
    similar.forEach(ss => {
      if ((ss.indexOf(pth1) !== -1)) {
        injected = true;
      }
    })
    if (!injected) {
      similar.push([pth1]);
    }
  });

  Object.keys(debugs).forEach((pth) => {
  })
}

module.exports = findSimilarByStats;
