const modelName = 'SCENE';
const INITIAL_STATE = { activeMatrix : '' };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INC_SCENE':
      console.log('6');
      const a = state;
      a.activeMatrix = action.payload;
      return {...a};
    default:
      return state;
  }
}
