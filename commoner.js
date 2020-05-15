const fs = require('fs').promises;
const beautify = require('beautify');
var cleanCSS = require('clean-css');

// for: chrome-79
const puppeteer = require('puppeteer-core');

// const origin = 'https://topwritingreviews.writershub.org';
// const origin = 'https://topwritingreviews.com';
// const origin = 'https://ratedbystudents.writershub.org/';
// const origin = 'https://ratedbystudents.com';
// const origin = 'https://essayguard.writershub.org/';
// const origin = 'https://essayguard.com';
// const origin = 'https://alltopreviews.writershub.org/';
// const origin = 'https://alltopreviews.com/';

// const origin = 'https://classyessay.com/';
const origin = 'https://bestessay.education/';


const credentials = {
  username: 'develop',
  password: 'trohim',
};
const paths = [
  '/',
  '/admission-services',
  '/annotated-bibliography-writing-help',
  '/article-critique-assistance',
  '/articles-writing-help',
  '/blog',
  '/blog/p/2',
  '/blog/all-truth-about-worlds-most-powerful-universities',
  '/blog/proper-language-and-sentence-structure-for-academic-writing',
  '/blog/research-process-steps-your-ultimate-guide-for-best-papers',
  '/blogpost-writing-help',
  '/book-report-writing',
  '/book-review-services',
  '/calculation-problems-solving',
  '/case-study-production',
  '/cookie-policy',
  '/copywriting',
  '/coursework-writing-service',
  '/cover-letter-writing',
  '/create-product-review',
  '/creating-press-release',
  '/cv-editing-for-you',
  '/cv-writings-assistance',
  '/discounts',
  '/dissertation-abstract',
  '/dissertation-discussion',
  '/dissertation-literature-review',
  '/dissertation-results',
  '/dissertation-services',
  '/dissertation-thesis',
  '/dissertation-writing-services',
  '/editing',
  '/equation-solving',
  '/essay-writing-services',
  '/evaluation/new',
  '/extras',
  '/help-with-resume-design',
  '/help-with-scholarship-essay',
  '/introduction-chapter',
  '/lauren-gartner',
  '/linkedin-pro-bio-profile',
  '/making-reaction-papers',
  '/math-physics-economics-statistics',
  '/methodology',
  '/modeling-tasks',
  '/money-back-guarantee',
  '/movie-review-services',
  '/multiple-choice-questions-time-non-time',
  '/news-article',
  '/optimizations',
  '/order',
  '/our_bloggers',
  '/perfect-admission-essay',
  '/personal-statement-writing',
  '/prices',
  '/proof-finding',
  '/proofreading',
  '/questions',
  '/research-paper-writing-services',
  '/research-problem',
  '/research-summary-writing',
  '/resume-cv-services',
  '/resume-writing-service',
  '/resumes-editing-help',
  '/rewriting',
  '/samples',
  '/samples/popularity-of-cartoons',
  '/services',
  '/technical-lab-report',
  '/term-paper-writing',
  '/terms',
  '/testimonials',
  '/thesis-writing-services',
  '/website-content-from-scratch',
  '/website-review-service',
  '/writing-services',
];


const versions = {
  // desktop: {
  //   devices: [
  //     {
  //       name: 'MacBook Pro 2015',
  //       userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36',
  //       viewport: {
  //         width: 1440,
  //         height: 789,
  //         deviceScaleFactor: 2,
  //         isMobile: false,
  //         hasTouch: false,
  //         isLandscape: true
  //       }
  //     },
  //   ],
  // },
  // tablet: {
  //   devices: [
  //     puppeteer.devices['iPad Mini'],
  //     puppeteer.devices['iPad Pro'],
  //   ],
  // },
  mobile: {
    devices: [
      puppeteer.devices['Galaxy Note 3'],
      puppeteer.devices['iPhone 4'],
      puppeteer.devices['iPhone X'],
    ],
  },
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function getCoverage({ page, path, device, kind, hoverable }) {
  await page.emulate(device);
  const relative = path.replace(origin, '');
  console.log(`Visit: [${kind}] ${relative} WITH ${device.name}`);
  await page.goto(path);

  //
  await page.evaluate(_ => {
    if (typeof(jQuery) === 'function') {
      jQuery.expr.filters.offscreen = function (el) {
        var rect = el.getBoundingClientRect();
        return (
          (rect.x + rect.width) < 0
          || (rect.y + rect.height) < 0
          || (rect.x > window.innerWidth || rect.y > window.innerHeight)
        );
      };
      $(':offscreen').remove();
    }
  });

  const visit_type = [
    kind,
    relative,
    device.name
  ].map(p => {
    return p.toString()
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '_')
            .replace(/(^_|_$)/, '');
  }).join('_');

  await page.screenshot({ path: `screens/${visit_type}.jpg`, fullPage: false });

  await page.coverage.startCSSCoverage({
    resetOnNavigation: true,
  });

  const coverage = await page.coverage.stopCSSCoverage();

  return coverage.filter(src => {
    return (
      /\.cloudfront\.net/.test(src.url) ||
        src.url.startsWith(origin)
    );
  });
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

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(true);
  await page.emulateMediaType('screen');
  await page.authenticate(credentials);

  let contents = {};
  let ranges = {};

  await asyncForEach(Object.entries(versions), async ([kind, params]) => {
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
    return {
      src: src,
      content: contents[src],
      ranges: ranges[src],
    };
  });
  await fs.writeFile(`dist/dump.json`, JSON.stringify(raw));

  await browser.close();
})();
