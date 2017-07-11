const modelName = 'TIDAL';
const INITIAL_STATE = { isActive: false, pattern: [] };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      console.log(action.payload);
      const tidal = action.payload
      return tidal;
    default:
      return state;
  }
}
