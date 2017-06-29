import _ from 'lodash';
const modelName = 'CHANNEL';
const INITIAL_STATE = {channels_state: [{}]};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CREATE_'+modelName:
      const p = state;
      p.channels_state.push(action.payload);
      return {...p};
    case 'UPDATE_'+modelName:
      const z = state;
      _.forEach(action.payload.channels, function(chan, i) {
        z.channels_state[i]= chan;
      });
      return {...z};
    default:
      return state;
  }
}
