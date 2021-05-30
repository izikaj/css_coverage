const fs = require('fs').promises;
const padTo = require('./padTo');

const COLORS = [
  '#fff',
  '#efe',
  '#afa',
  '#9f9',
  '#7f7',
];

const colors = () => {
  let result = '';

  for (let index = 1; index < 20; index++) {
    result += `
      .rate-${index} {
        background-color: ${COLORS[index % COLORS.length]};
      }
    `;
  }

  return result;
}

async function debugHeatmap({ content, hmap, pwd, namespace, suffix }) {
  if (suffix === undefined) {
    suffix = '0';
  }
  let debugContent = `
    <style>
      .unused {
        color: #eee;
      }
      .used {
        color: #000;
      }
      ${colors()}
    </style>
  `;
  let prevRate = null, rate, unused, sym;
  for (let index = 0; index < content.length; index++) {
    sym = content[index];
    rate = hmap[index];
    unused = rate <= 0;

    if (prevRate !== rate) {
      if (prevRate !== null) {
        debugContent += '</span>';
      }
      debugContent += `<span class="${unused ? 'unused' : 'used'} rate-${rate}">`;
      prevRate = rate;
    }
    if (/\s/.test(sym)) {
      if (sym === '\n') {
        debugContent += '</span>'
        debugContent += '<br/>'
        debugContent += `<span class="${unused ? 'unused' : 'used'} rate-${prevRate}">`
      } else {
        debugContent += '&nbsp;'
      }
    } else {
      debugContent += sym;
    }
  }
  if (prevRate !== null) {
    debugContent += '</span>';
  }

  await fs.writeFile(`${pwd || 'dist'}/${namespace}_${suffix}.html`, `<html><body>${debugContent}</body></html>`);
}

module.exports = debugHeatmap;
