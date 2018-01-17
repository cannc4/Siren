import _ from 'lodash';
import { combineReducers } from 'redux';
import user from './user';
import sccommand from './sccommand';
import tidal from './tidal';
import click from './click';
import channel from './channel';
import layout from './layout';
import cell from './cell';
import menu from './menu';
import seq from './seq';
import globalparams from './global';
import usererror from './usererror';
import { fetchModels } from '../actions';
const models = fetchModels();
const keys = {}
_.each(models, (x,key) => {
  const INITIAL_STATE = {}
  keys[x] = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'FETCH_' + x.toUpperCase():
        const items = _.mapKeys(action.payload, 'key')
        return { ...items };
    case 'FETCH_COMMANDS':
      const cmd = _.mapKeys(action.payload, 'key')
      return { ...cmd};
    default:
        return state
    }
  }
})

const rootReducer = combineReducers({
  sccommand,
  tidal,
  seq,
  channel,
  user,
  usererror,
  click,
  layout,
  menu,
  globalparams,
  cell,
  ...keys
});

export default rootReducer;
