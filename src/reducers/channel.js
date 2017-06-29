import _ from 'lodash';
const modelName = 'CHANNEL';
const INITIAL_STATE = [ ];
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CREATE_'+modelName:
      const p = state;
      console.log("CREATE REDUCER: ", state, action.payload);
      p.push(action.payload);
      return {...p};
    case 'UPDATE_'+modelName:
      const z = state;
      console.log("UPDATE REDUCER: ", state, action.payload);
      _.forEach(action.payload.channels, function(chan, i) {
        z[i] = chan;
      });
      return {...z};
    default:
      return state;
  }
}
