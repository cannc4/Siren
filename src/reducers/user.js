const modelName = 'USER';
const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      const user = action.payload
      return user;
    default:
      return state;
  }
}
