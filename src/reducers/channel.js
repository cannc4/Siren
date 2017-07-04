import _ from 'lodash';
const modelName = 'CHANNEL';
const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // action.payload = channel
    case 'CREATE_'+modelName:
      const p = state;
      p[action.payload.key] = action.payload;
      return {...p};
    // action.payload = scene
    case 'UPDATE_'+modelName:
      const z = state;
      if (action.payload.channels !== undefined)
        _.forEach(action.payload.channels, function(chan, i) {
          z[i] = chan;
        });
      return {...z};
    // action.payload = channel key
    case 'DELETE_'+modelName:
      var k = state;
      delete k[action.payload]
      return {...k};
    default:
      return state;
  }
}
