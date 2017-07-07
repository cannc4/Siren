const modelName = 'MENU';
const INITIAL_STATE = { version: '0.3' };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'VERSION_'+modelName:
      return state;
    default:
      return state;
  }
}
