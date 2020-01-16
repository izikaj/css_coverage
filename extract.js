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
  {
    on: 'page',
    method: 'hover',
    selector: '.drop',
  }
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

async function makeOperations({ page }) {
  await asyncForEach(operations, async ({on, method, ...params}) => {
    switch (on) {
      case 'page':
        switch ('method') {
          case 'hover':
            await page.hover(params.selector);

            break;
          default:
            break;
        }
        break;
    }
  });
}

async function getCoverage({ page, path, device, kind }) {
  await page.emulate(device);
  await page.coverage.startCSSCoverage({
    resetOnNavigation: true,
  });
  const relative = path.replace(origin, '');
  console.log(`Visit: [${kind}] ${relative} vith ${device.name}`);
  await page.goto(path);
  await makeOperations({page});
  await page.screenshot({ path: `screens/${kind}_${device.name}.jpg`, fullPage: true });

  const coverage = await page.coverage.stopCSSCoverage();

  return coverage.filter(src => src.url.startsWith(origin));
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

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(false);
  await page.emulateMediaType('screen');
  await page.authenticate(credentials);

  const report = {};
  let contents = {}
  let ranges = {}

  await asyncForEach(Object.entries(versions), async ([kind, params]) => {
    report[kind] = {}
    await asyncForEach(params.devices, async (device) => {
      await asyncForEach(paths, async (path) => {
        const cov = await getCoverage({ page, path: `${origin}${path}`, kind, device });
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
  await fs.writeFile(`full_clean_css.css`, cssOptimizations.styles);

  await browser.close();
})();
