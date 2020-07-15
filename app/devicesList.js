const devices = require('puppeteer-core/DeviceDescriptors');

const macBookPro = {
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
};

const iPad = devices['iPad'];
const iPadPro = devices['iPad Pro'];
const galaxyNote3 = devices['Galaxy Note 3'];
const iPhone4 = devices['iPhone 4'];
const iPhone8plus = devices['iPhone 8 Plus'];
const iPhoneX = devices['iPhone X'];

const devicesList = {
  // single devices:
  // desktop
  macBookPro,
  // tablet
  iPad,
  iPadPro,
  // mobile
  galaxyNote3,
  iPhone4,
  iPhoneX,
  iPhone8plus,

  // groups:
  desktop: [macBookPro],
  tablet: [iPad, iPadPro],
  mobile: [galaxyNote3, iPhone4, iPhoneX, iPhone8plus],
}

module.exports = devicesList;
