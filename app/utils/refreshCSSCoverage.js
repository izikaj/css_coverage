const extractByRanges = require('./extractByRanges');
const css = require('css');
const url = require('url');
const path = require('path');

const BLACKLIST = [{
  url: 'https://static.botsrv2.com'
}, ];

async function hasVisibleTarget({
  page,
  selector,
  cache
}) {
  if (typeof cache === 'undefined') {
    cache = {};
  }

  if (typeof cache[selector] !== 'undefined') {
    return Promise.resolve(cache[selector]);
  }

  const result = await page.evaluate((selector) => {
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

  cache[selector] = result;
  return result;
}

function isCovered(index, ranges) {
  for (const range of ranges) {
    if ((index >= range.start) && (index <= range.end)) {
      return true;
    }
  }
  return false;
}

const absPosition = (position, content) => {
  const lines = content.split("\n", position.line);
  let pos = 0;
  for (let index = 0; index < lines.length - 1; index++) {
    pos += lines[index].length + 1;
  }

  return pos + position.column - 1;
}

const extractMediaRanges = (text, rules) => {
  const result = [];
  if (typeof rules === 'undefined') {
    const parsed = css.parse(text);
    rules = parsed.stylesheet.rules;
  }

  for (const rule of rules) {
    if (rule.type === 'media') {
      const headStart = absPosition(rule.position.start, text);
      const tailEnd = absPosition(rule.position.end, text);
      const tailStart = tailEnd - 1;
      let headEnd = headStart + 7 + rule.media.length;

      for (let i = (headStart + 5); i < text.length; i++) {
        const sym = text[i];
        if (sym === '{') {
          headEnd = i + 1;
          break
        }
      }

      // console.log(`M ${rule.media}`);
      // console.log(`> [${text.slice(headStart, headEnd)}]`);
      // console.log(`< [${text.slice(tailStart, tailEnd)}]`);

      result.push({
        start: headStart,
        end: headEnd
      }, {
        start: tailStart,
        end: tailEnd
      });
      result.push(...extractMediaRanges(text, rule.rules));
    }
  }

  return result;
};

const extractCSSRuleRanges = (text, rules) => {
  const result = [];
  if (typeof rules === 'undefined') {
    const parsed = css.parse(text);
    rules = parsed.stylesheet.rules;
  }

  for (const rule of rules) {
    if (rule.type === 'rule') {
      const {
        selectors,
        position
      } = rule;
      const start = absPosition(position.start, text);
      const end = absPosition(position.end, text);

      // console.log(`R ${selectors.join(', ')} `);
      // console.log(`>>> [${ text.slice(start, end) }]`);

      result.push({
        selectors,
        start,
        end,
      });
      continue;
    }

    if (rule.type === 'media') {
      result.push(...extractCSSRuleRanges(text, rule.rules));
    }
  }

  return result;
};

async function cleanItem({
  page,
  item,
  cache,
  fullPage,
}) {
  const ranges = [];

  for (const rule of BLACKLIST) {
    if (!rule.url) {
      continue;
    }
    if ((typeof rule.url === 'string') && (item.url.indexOf(rule.url) === -1)) {
      continue;
    }
    if ((typeof (rule.url && rule.url.test) === 'function') && !rule.url.test(item.url)) {
      continue;
    }
    console.log('blacklist report item', item.url, item.text.length, '=> 0');
    return {
      ...item,
      ranges
    };
  }

  // skip removing ofscreen for full page
  if (fullPage) return item;

  const c1 = extractByRanges(item.text, item.ranges);
  if (c1.length === 0) return item;

  const mediaRanges = extractMediaRanges(item.text);
  ranges.push(...mediaRanges);

  const ruleRanges = extractCSSRuleRanges(item.text);
  for (const rule of ruleRanges) {
    const {
      selectors,
      start,
      end
    } = rule;

    // skip uncovered selectors
    if (!isCovered(start, item.ranges)) continue;

    let used, stat = {
      used: [],
      unused: []
    };
    for (const part of selectors) {
      const selector = part.replace(/:(before|after|hover|active|visited|focus)/g, '');

      if (await hasVisibleTarget({
          page,
          selector,
          cache
        })) {
        used = true;
        stat.used.push(part);
      } else {
        stat.unused.push(part);
      }
      if (end - start > 10000) {
        console.log(` >>> ${selector} - ${used} // ${start} - ${end}`);
      }
    }
    if (used) {
      ranges.push({
        start,
        end
      });
    }
  }

  const c2 = extractByRanges(item.text, ranges);
  const URL = new url.URL(item.url);
  const host = URL.hostname;
  const pathname = URL.pathname;
  const name = path.basename(pathname);

  console.log('clean report item', `[${host}] ${name}`, item.text.length, '=>', c1.length, '=>', c2.length);

  if (item.text.length < c2.length) {
    // someting goes wrong
    process.exit(99);
  } else if (c1.length < c2.length) {
    // require('colors');
    // const Diff = require('diff');
    // const diff = Diff.diffLines(c1, c2);
    // diff.forEach((part) => {
    //   // green for additions, red for deletions
    //   // grey for common parts
    //   if (part.added || part.removed) {
    //     const color = part.added ? 'green' :
    //       part.removed ? 'red' : 'grey';
    //     process.stderr.write(part.value[color]);
    //   }
    // });
    // console.log();
  }

  return {
    ...item,
    ranges
  };
}

async function refreshCSSCoverage({
  coverage,
  ...opts
}) {
  const refreshed = [];
  const cache = {};
  for (const item of coverage) {
    refreshed.push(await cleanItem({
      ...opts,
      cache,
      item,
    }));
  }
  return refreshed;
}

module.exports = refreshCSSCoverage;
