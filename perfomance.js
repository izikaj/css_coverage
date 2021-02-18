const fs = require('fs').promises;
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const log = require('lighthouse-logger');
const cleanFolder = require('./app/utils/cleanFolder');
const urlsFromArgs = require('./app/utils/urlsFromArgs');

const DEFAULT_OPTIONS = {
  output: 'html',
  onlyCategories: ['performance'],
  throttlingMethod: 'provided',
  extraHeaders: { 'Authorization': 'Basic ZGV2ZWxvcDp0cm9oaW0=' },
};

const KEY_METRICS = [
  'first-contentful-paint',
  'speed-index',
  'largest-contentful-paint',
  'interactive',
  'total-blocking-time',
  'cumulative-layout-shift',
];

async function getReportData(params = {}) {
  const { path } = params;
  const report = await lighthouse(path, params);
  let data = {};

  data.score = report.lhr.categories.performance.score;
  data.url = report.lhr.finalUrl;

  const items = [];
  for (let index = 0; index < KEY_METRICS.length; index++) {
    const metric_name = KEY_METRICS[index]
    const { title, score, displayValue } = report.lhr.audits[metric_name];
    const item = {
      title, score, displayValue
    };
    data[metric_name] = item;
    items.push(item);
  }

  const warnings = items.
    sort(({score: a}, {score: b}) => a < b ? -1 : a > b ? 1 : 0).
    filter(({score}) => score < 0.9).slice(0,3);
  let status = `${(data.score * 100).toFixed(2)}%`;
  for (let jj = 0; jj < warnings.length; jj++) {
    const itm = warnings[jj];
    status = `${status} - ${itm.title}: ${itm.displayValue}(${itm.score})`;
  }
  console.log(status);

  return data;
}

const rand = (items) => items[~~(Math.random() * items.length)];

async function getAvgReportData(params = {}) {
  const {count, ...reportParams} = params;
  let reports = []

  for (let iteration = 0; iteration < count; iteration++) {
    console.log(`Fetch reports... ${iteration + 1}/${count}`);
    reports.push(await getReportData(reportParams));
  }

  let minScore = 1, maxScore = 0, sumScore = 0;
  for (let i = 0; i < count; i++) {
    const r = reports[i];

    r.score = r.score || 0;
    sumScore += r.score;
    if (r.score < minScore) { minScore = r.score }
    if (r.score > maxScore) { maxScore = r.score }
  }

  let avg = {
    url: reports[0].url,
    device: params.emulatedFormFactor || 'mobile',
    score: {
      min: minScore,
      max: maxScore,
      avg: sumScore / count,
    },
  }

  for (let index = 0; index < KEY_METRICS.length; index++) {
    minScore = 1;
    maxScore = 0;
    sumScore = 0;
    const metric_name = KEY_METRICS[index]

    avg[metric_name] = {
      title: reports[0][metric_name].title,
      score: {},
      displayValue: [],
    };
    for (let i = 0; i < count; i++) {
      let { score, displayValue } = reports[i][metric_name];
      score = score || 0;
      sumScore += score;
      if (score < minScore) { minScore = score }
      if (score > maxScore) { maxScore = score }
      avg[metric_name].displayValue.push(displayValue);
      // if (avg[metric_name].displayValue.indexOf(displayValue) === -1) {
      //   avg[metric_name].displayValue.push(displayValue);
      // }
    }
    avg[metric_name].score.min = minScore;
    avg[metric_name].score.max = maxScore;
    avg[metric_name].score.avg = sumScore / count;
  }

  return avg;
}

(async () => {
  log.setLevel('info');

  console.log('Launching Chrome...');

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--ignore-certificate-errors'],
    logLevel: 'info',
  });

  console.log('Chrome is ready!');

  const versions = ['mobile', 'desktop'];
  const runsCount = 3;

  const pages = urlsFromArgs();

  const timings = [
    1,
    500,
    1000,
    // 1500,
    // 2000,
    // 2500,
    // 3000,
    // 3500,
    // 4000,
    // 5000,
    // 6000,
    // 7000,
    // 8000,
    // 9000,
    // 10000,
  ]

  const reports = [];
  const MAX_REPORTS = 3;
  let itemsCount = (await fs.readdir('dist')).filter(f => /\/report_\d+.json/.test(f)).length;

  while (itemsCount < MAX_REPORTS) {
    const timing = rand(timings);
    const pageUrl = rand(pages);
    const version = 'desktop';
    // const version = rand(versions);
    try {
      console.log(`Inspect page: ${itemsCount + 1}/${MAX_REPORTS} ${pageUrl} as ${version} with ${timing}ms timeout`);
      const avg = {
        ...await getAvgReportData({
          ...DEFAULT_OPTIONS,
          path: `${pageUrl}?${timing}`,
          count: runsCount,
          port: chrome.port,
          emulatedFormFactor: version
        }),
        timing,
      };

      console.log('SCORE:', avg.score);
      for (let mni = 0; mni < KEY_METRICS.length; mni++) {
        const metric = avg[KEY_METRICS[mni]];
        console.log(metric.title, metric.score);
        console.log('   > ', metric.displayValue.join(' - '));
      }

      await fs.writeFile(`dist/report_${itemsCount}.json`, JSON.stringify(avg));
      reports.push(avg);
      itemsCount++;
    } catch (err) {
      console.warn('ERROR:', err);
    }
  }

  const reportFiles = (await fs.readdir('dist')).filter(f => /\/report_\d+.json/.test(f));
  console.log('reports', reportFiles);

  reportFiles.forEach(name => {
    try {
      const report = JSON.parse(fs.readFile(name));
      reports.push(report);
    } catch (error) {
    }
  });

  await fs.writeFile(`dist/perfomance_report.json`, JSON.stringify(reports));
  await cleanFolder('dist', f => /report_\d+.json/.test(f));

  console.log('All reports compleded!');
  await chrome.kill();
})();
