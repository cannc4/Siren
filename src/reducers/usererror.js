const modelName = 'USER';
const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName+"_ERROR":
      const e = action.payload
      return { ...e };
    default:
      return state;
  }
}
