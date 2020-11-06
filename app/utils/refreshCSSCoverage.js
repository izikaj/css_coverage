const extractByRanges = require('./extractByRanges');
const nestedRuleRegex = /(@[\w\-]+\s*[^\;]+?\{)([^{]*|.*?\}\s*)(\})/mg;
const lineRegex = /([^\}\{]*)\{([^\}\{]*?)\}/mg;

function fill(count, char = ' ') {
  return (new Array(count+1).join(char));
}

async function hasVisibleTarget(page, selector) {
  return await page.evaluate((selector) => {
    var list = [];
    try {
      list = document.querySelectorAll(selector);
    } catch (error) {
      return false;
    }

    if (list.length === 0) {
      return false;
    }

    for (var ii = 0; ii < list.length; ii++) {
      const node = list[ii];
      var rect = node.getBoundingClientRect();
      var invisible = (
        (rect.x + rect.width) < 0 ||
        (rect.y + rect.height) < 0 ||
        rect.x > window.innerWidth ||
        rect.y > window.innerHeight
      );

      if (!invisible) {
        return true;
      }
    }
    return false;
  }, selector);
}

function isCovered(index, ranges)
{

  for (let ii = 0; ii < ranges.length; ii++) {
    const at = ranges[ii];
    if ((index >= at.start) && (index <= at.end)) {
      return true;
    }
  }
  return false;
}

async function cleanItem(page, item) {
  const ranges = [];
  let content = item.text.replace(nestedRuleRegex, function(full, prefix, content, suffix) {
    if (/^@media/.test(prefix)) {
      // partial escape rule
      return `${fill(prefix.length)}${content}${fill(suffix.length)}`;
    } else {
      // full escape rule
      return fill(full.length);
    }
  })

  let match, cursor, data;
  while (match = lineRegex.exec(content)) {
    data = match[1].trim();
    cursor = match.index + /^\s*/.exec(match[1])[0].length;
    if (!isCovered(cursor, item.ranges)) {
      // skip uncovered selectors
      continue;
    }
    if (await hasVisibleTarget(page, match[1])) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length
      });
    } else {
      // console.warn('SKIP CSS SELECTOR: ', match[1]);
    }
  }

  const c1 = extractByRanges(item.text, item.ranges);
  const c2 = extractByRanges(item.text, ranges);
  console.log('clean report item', item.url, item.text.length, '=>', c1.length, '=>', c2.length);

  return { ...item, ranges };
}

async function refreshCSSCoverage({ page, coverage }) {
  refreshed = [];
  for (let srcId = 0; srcId < coverage.length; srcId++) {
    refreshed.push(await cleanItem(page, coverage[srcId]));
  }
  return refreshed;
}

module.exports = refreshCSSCoverage;
