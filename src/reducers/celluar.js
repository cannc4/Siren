const modelName = 'CELLUAR';
const INITIAL_STATE = { };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      const s = state;
      s.value = action.payload;
      return {...s};
    default:
      return state;
  }
}
