const fs = require('fs').promises;
const beautify = require('beautify');
var cleanCSS = require('clean-css');

// for: chrome-79
const puppeteer = require('puppeteer-core');

const origin = 'http://topwritingreviews.writershub.org';
// const origin = 'https://topwritingreviews.com';
const credentials = {
  username: 'develop',
  password: 'trohim',
};
const paths = [
  '/services/rewarded-essays',
  '/services/getacademichelp',
  '/services/justbuyessay',
  '/services/helpfulpapers',
  '/services/essay-ws',
  '/services/assignment-expert',
];
const operations = [
  { on: 'page', method: 'hover', selector: '.drop' },
  { on: 'page', method: 'hover', selector: '.suggest_website a' },
  { on: 'page', method: 'hover', selector: '.header_links a' },
]
const versions = {
  desktop: {
    devices: [
      {
        name: 'MacBook Pro 2015',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36',
        viewport: {
          width: 1440,
          height: 789,
          deviceScaleFactor: 2,
          isMobile: false,
          hasTouch: false,
          isLandscape: true
        }
      },
    ],
    viewports: [
      {
        width: 1440,
        height: 789
      }
    ]
  },
  tablet: {
    devices: [
      puppeteer.devices['iPad Mini'],
      puppeteer.devices['iPad Pro'],
    ],
    viewports: [
      {
        width: 768,
        height: 1024
      }
    ]
  },
  mobile: {
    devices: [
      puppeteer.devices['Galaxy Note 3'],
      puppeteer.devices['iPhone 4'],
      puppeteer.devices['iPhone X'],
    ],
    viewports: [
      {
        width: 411,
        height: 731
      }
    ],
  },
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function makeOperations({ page, hoverable, device }) {
  await asyncForEach(operations, async ({on, method, ...params}) => {
    console.log('makeOperations: ', { method, params });
    try {
    } catch (error) {
      // console.log('OPERATION ERROR:', error);
    }
  });

  if (!device.isMobile) {
    await asyncForEach(hoverable, async (selector) => {
      try {
        await page.hover(selector);
      } catch (error) {
        // console.log('OPERATION ERROR:', error);
      }
    });
  }
}

async function getCoverage({ page, path, device, kind, hoverable }) {
  await page.emulate(device);
  await page.coverage.startCSSCoverage({
    resetOnNavigation: true,
  });
  const relative = path.replace(origin, '');
  console.log(`Visit: [${kind}] ${relative} vith ${device.name}`);
  await page.goto(path);
  await makeOperations({ page, hoverable, device });
  await page.screenshot({ path: `screens/${kind}_${device.name}.jpg`, fullPage: true });

  const coverage = await page.coverage.stopCSSCoverage();

  return coverage.filter(src => src.url.startsWith(origin));
}

async function getAllHoverable({ page, path }) {
  console.log('getAllHoverable', {path})
  await page.coverage.startCSSCoverage();
  await page.goto(path);
  let coverage = await page.coverage.stopCSSCoverage();
  css = coverage.filter(src => src.url.startsWith(origin)).map(src => src.text).join('\n\n');
  return findHoverable(css);
}

function findMediaRanges(content) {
  const sanitizeRegex = /\{[^\{\}]*?\}/mg
  const mediaRegex = /(@media.*?\{)(.*?)(\})/mg
  const ranges = []

  content = content.replace(sanitizeRegex, (s) => new Array(s.length + 1).join('_'))
  let match;
  while (match = mediaRegex.exec(content)) {
    const start = match.index
    const end = start + match[1].length
    const start2 = end + match[2].length
    const end2 = start + match[0].length
    ranges.push(
      { start, end },
      { start: start2, end: end2 }
    );
  }
  return ranges;
}

function sortRanges(ranges = []) {
  console.log('<<<', ranges.slice(ranges.length - 2));
  ranges = ranges.sort((r1, r2) => {
    return (r1.start > r2.start) ? 1 : (r1.start < r2.start) ? -1 : 0;
  });
  console.log('>>>', ranges.slice(ranges.length - 2));
  return ranges
}

function removeOverlaps(ranges = []) {
  let raw = []
  ranges = sortRanges(ranges);
  let cursor = 0;
  ranges.forEach(range => {
    if (cursor < range.start) {
      for (let index = cursor; index < range.start; index++) {
        raw[index] = raw[index] || 0
      }
    }
    for (let index = range.start; index < range.end; index++) {
      raw[index] = 1;
    }
    cursor = range.end;
  });

  const mask = raw.join('');
  const reg = /1+/g;

  const new_ranges = [];
  while (match = reg.exec(mask)) {
    match.index
    const start = match.index
    const end = start + match[0].length
    new_ranges.push({ start, end });
  }

  console.log(ranges.length, ' ===> ', new_ranges.length);
  return new_ranges;
}

function normalizeRanges(ranges = []) {
  return removeOverlaps(ranges);
}

function extractByRanges(content, ranges = []) {
  return normalizeRanges(ranges).map(range => {
    return content.slice(range.start, range.end);
  }).join('\n\n');
}

const HOVER_BLACKLIST = [
  /^.easy-autocomplete/,
  /^.select2/,
];

function filterBlackListedSelectors(items) {
  return Array.from(items).filter(selector => {
    for (let index = 0; index < HOVER_BLACKLIST.length; index++) {
      if (HOVER_BLACKLIST[index].test(selector)) {
        return false;
      }
    }
    return true;
  });
}

function findHoverable(css) {
  const regex = /(?:^|,|})([^,}]*?):hover/mg
  const hoverable = filterBlackListedSelectors(
    new Set(css.match(regex).map(s => s.replace(/^[},]\s*/, '').replace(/:hover$/, '')))
  );
  console.log(`Found ${hoverable.length} hoverable selectors`);
  return hoverable;
}

function purify(css) {
  return css.replace(/\s*!important;?$/, ';')
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(false);
  await page.emulateMediaType('screen');
  await page.authenticate(credentials);

  let contents = {};
  let ranges = {};
  let hoverable = await getAllHoverable({ page, path: `${origin}${paths[0]}` });

  await asyncForEach(Object.entries(versions), async ([kind, params]) => {
    await asyncForEach(params.devices, async (device) => {
      await asyncForEach(paths, async (path) => {
        const cov = await getCoverage({ page, path: `${origin}${path}`, kind, device, hoverable });
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
  });

  const raw = Object.keys(ranges).map((src) => {
    return extractByRanges(contents[src], ranges[src]);
  }).join('\n\n\n');

  await fs.writeFile(`full_css.css`, beautify(raw, { format: 'css' }));
  // await fs.writeFile(`full_css.css`, beautify(raw, { format: 'css' }));

  const cssOptimizations = new cleanCSS({
    format: 'beautify',
  }).minify(raw);
  console.log(cssOptimizations.errors, cssOptimizations.warnings, cssOptimizations.stats);
  await fs.writeFile(`full_clean_css.css`, purify(cssOptimizations.styles));

  await browser.close();
})();
