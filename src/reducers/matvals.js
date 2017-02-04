const modelName = 'LIVE';
const INITIAL_STATE = {values: {}};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      const k = state;
      console.log(action.payload);
      k.values = action.payload;
      return {...k};
      default:
      return state;
  }
}
