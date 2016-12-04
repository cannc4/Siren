const modelName = 'TIMER';
const INITIAL_STATE = { isActive: false, current: 0 };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INC_'+modelName:
      const s = state;
      s.isActive = true;
      s.current++;
      return {...s};
    case 'STOP_'+modelName:
      const b = state;
      b.isActive = false;
      b.current= 0;
      return {...b};
    default:
      return state;
  }
}
