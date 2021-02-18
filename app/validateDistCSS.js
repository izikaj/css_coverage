const fs = require('fs');
const path = require('path');
//

async function validateDistCSS() {
  fs.readdir('dist', (err, files) => {
    if (err) throw err;

    for (const file of files) {
      if (!/\.css$/.test(file)) { continue; }

      const content = fs.readFileSync(path.join('dist', file));
      //
      try {
        // const CleanCSS = require('clean-css');
      } catch (error) {
        console.log('ERROR', error);
      }
    }
  });
}

module.exports = validateDistCSS;
