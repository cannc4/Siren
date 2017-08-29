import path from 'path';
import fs from 'fs';

const root = path.join(__dirname, '..');
const getConfig = () => {
  return {
    "userpath": "~/",
    "debug": true,
    "ghcipath": "/Library/Frameworks/GHC.framework/Versions/8.0.1-x86_64/usr/bin/ghci-8.0.1",
    "sclang": "/Applications/SuperCollider.app/Contents/MacOS/sclang",
    "scsynth": "/Applications/SuperCollider.app/Contents/Resources/scsynth",
    "sclang_conf": "~/Library/Application Support/SuperCollider/sclang_conf.yaml",
    "port": 3001,
    "path" : path.join(root, "config/config.json"),
    "tidal_boot": path.join(root, "config/tidal-boot-default.hs"),
    "scd_start": path.join(root, "config/scd-start-default.scd")
  }
}

const createJson = () => {
  const json = JSON.stringify(getConfig(), null, 2);
  fs.unlink('config/config.json', function(err){

      // Ignore error if no file already exists
      if (err && err.code !== 'ENOENT')
          throw err;

      var options = { flag : 'w' };
      fs.writeFile('config/config.json', json, options, function(err) {
          if (err) throw err;
          console.log('config.json saved');
      });
  });
}

createJson();
setTimeout(() => {}, 1000)

export default getConfig;
