const fs = require('fs');
const path = require('path');

const rename = (from, to) => {
  fs.rename(from, to, function (err) {
    if (err) throw err;
    console.log('renamed complete');
  });
}

const readFolders = () => {
  return fs.readdirSync(path.join(__dirname, 'samples'))
}

const renameAll = () => {
  const paths = readFolders().map((folder) => {
    const x = path.join(__dirname, 'samples', folder)
    return x
  }).forEach((f) => {
    rename(f, f.split('-').join('_').split(' ').join('_'));
  })
}

renameAll();
