const devices = require('puppeteer/DeviceDescriptors');

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

const iPadMini = devices['iPad Mini'];
const iPadPro = devices['iPad Pro'];
const galaxyNote3 = devices['Galaxy Note 3'];
const iPhone4 = devices['iPhone 4'];
const iPhoneX = devices['iPhone X'];

const devices = {
  // single devices:
  // desktop
  macBookPro,
  // tablet
  iPadMini,
  iPadPro,
  // mobile
  galaxyNote3,
  iPhone4,
  iPhoneX,

  // groups:
  desktop: [macBookPro],
  tablet: [iPadMini, iPadPro],
  mobile: [galaxyNote3, iPhone4, iPhoneX],
}

module.exports = devices;
