import _ from 'lodash';
const modelName = 'CHANNEL';
const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // action.payload = channel
    case 'CREATE_'+modelName:
      const p = state;
      console.log("CREATE REDUCER: ", state, action.payload);
      p[action.payload.key] = action.payload;
      // console.log("CREATE REDUCER 2: ", state, action.payload);
      return {...p};
    // action.payload = scene
    case 'UPDATE_'+modelName:
      const z = state;
      console.log("UPDATE REDUCER: ", state, action.payload);
      if (action.payload.channels !== undefined)
        _.forEach(action.payload.channels, function(chan, i) {
          console.log(i, chan);
          z[i] = chan;
        });
      return {...z};
    // action.payload = channel key
    case 'DELETE_'+modelName:
      var k = state;
      console.log("DELETE REDUCER: ", state, action.payload);
      delete k[action.payload]
      console.log("DELETE REDUCER 2: ", state);

      return {...k};
    default:
      return state;
  }
}
