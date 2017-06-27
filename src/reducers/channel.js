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
      var zk =  [{}];
      zk.push(action.payload);
      z.channels_state = zk;
      return {...z};
    default:
      return state;
  }
}
