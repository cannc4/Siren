import _ from 'lodash';
const modelName = 'TIDAL';
const INITIAL_STATE = { isActive: false, pattern: [], config: false, debugconsole: '', server_status: 500};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      var tidal = action.payload.data;
      tidal.server_status = action.payload.status;
      return tidal;
    case 'CONFIG_'+modelName:
      const k = state;
      k.config = action.payload.data;
      return k;
    case 'DEBUG_'+modelName:
      const c = state;
      var console_len = 20;
      c.debugconsole = _.concat(c.debugconsole,Object.values(action.payload));
      if(c.debugconsole.length > console_len){
        c.debugconsole = _.drop( c.debugconsole , console_len);
      }
      return c;
    default:
      return state;
  }
}
