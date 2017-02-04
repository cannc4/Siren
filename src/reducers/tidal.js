const modelName = 'TIDAL';
const INITIAL_STATE = { isActive: false, commands: [] };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      const tidal = action.payload
      console.log('TIDAL');
      console.log(tidal);
      return tidal;
    default:
      return state;
  }
}
