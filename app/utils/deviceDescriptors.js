const DEVICES = require('puppeteer-core').devices;

// 390x844	289(16.06%)	iPhone 12
// 428x926	255(14.17%)	iPhone 12 Pro Max
// 375x812	165(9.17%) iPhone X
// 360x640	71(3.94%) Moto G4 / Galaxy S5
// 320x569	21(1.17%)	iPhone SE
// 412x732	17(0.94%) Nexus 6
// 414x896	364(20.22%) iPhone XR
// 360x800	77(4.28%)	???? Galaxy S9/S10+???
// Samsung SM-G981U Galaxy S20 5G	15(0.83%) -- 480x1067

const READY_DEVICES = {
  // mobile:
  iPhoneX: DEVICES['iPhone X'],
  iPhoneSE: DEVICES['iPhone SE'],
  Nexus6: DEVICES['Nexus 6'],
  iPhoneXR: DEVICES['iPhone XR'],
  // tablet:
  iPad: DEVICES['iPad'],
  iPadMini: DEVICES['iPad Mini'],
  iPadPro: DEVICES['iPad Pro'],
};

const EXTRA_DEVICES = {
  // mobile:
  iPhone12: {
    name: 'iPhone 12',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  iPhone12ProMax: {
    name: 'iPhone 12 Pro Max',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
    viewport: {
      width: 428,
      height: 926,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  MotoG4: {
    name: 'Moto G4',
    userAgent: 'Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4812.0 Mobile Safari/537.36',
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  GalaxyS9: {
    name: 'Galaxy S9+',
    userAgent: 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G965U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
    viewport: {
      width: 320,
      height: 658,
      deviceScaleFactor: 4.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  GalaxyS20: {
    name: 'Galaxy S20 5G',
    userAgent: 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G981U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
    viewport: {
      width: 480,
      height: 1067,
      deviceScaleFactor: 4.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  // desktop:
  macBookPro: {
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
};

const ITEMS = {
  ...READY_DEVICES,
  ...EXTRA_DEVICES,
};

const GROUPS = {
  desktop: [ITEMS.macBookPro],
  tablet: [ITEMS.iPad, ITEMS.iPadMini, ITEMS.iPadPro],
  mobile: [
    ITEMS.MotoG4, ITEMS.iPhone12, ITEMS.iPhone12ProMax,
    ITEMS.iPhoneX, ITEMS.Nexus6
  ],
};

module.exports = {
  ...ITEMS,
  ...GROUPS,
};
