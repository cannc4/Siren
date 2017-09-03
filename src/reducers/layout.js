const modelName = 'LAYOUT';
const INITIAL_STATE = {windows: {}};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // action.payload is the whole layout
    case 'UPDATE_'+modelName:
      const l = state;
      l.windows = action.payload;
      return {...l};
    default:
      return state;
  }
}
