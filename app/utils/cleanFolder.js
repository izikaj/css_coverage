const fs = require('fs');
const path = require('path');

async function cleanFolder(directory, checker = () => true) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      if (!checker(file)) { continue; }

      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
}


module.exports = cleanFolder;
