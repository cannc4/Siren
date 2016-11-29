import _ from 'lodash';
import fs from 'fs';

import default_config from './default/config.json';
import user_config from './user/config.json';

const mergedEnv = _.assign(default_config, user_config);
const envStr = JSON.stringify(mergedEnv, null, 2).split("~").join(mergedEnv.userpath);
const env = JSON.parse(envStr);
const p = __dirname + '/generated_config.json';

const createEnv = () => {
  if (fs.existsSync(p)) fs.unlink(p);
  fs.writeFile(p, JSON.stringify(env, null, 2), 'utf-8');
  return p
}

env.path = createEnv()

export default env;
