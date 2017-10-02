const modelName = 'MENU';
const INITIAL_STATE = { version: '0.5', serverActive: false };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'VERSION_'+modelName:
      return state;
    case 'ACTIVE_'+modelName:
      state.serverActive = action.payload;
      return state;
    default:
      return state;
  }
}
