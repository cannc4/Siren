const modelName = 'ACCOUNTS';
const INITIAL_STATE = {user: {}};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      const s = state;
      s.user = action.payload;
      return {...s};
    default:
      return state;
  }
}
