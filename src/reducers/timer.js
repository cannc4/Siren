const modelName = 'TIMER';
const INITIAL_STATE = { isActive: false, current: 0, isCelluarActive: false};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INC_'+modelName:
      const s = state;
      s.isActive = true;
      s.current++;
      return {...s};
    case 'FETCH_'+modelName:
      const a = state;
      a.isCelluarActive = true;
      return {...a};
    case 'FETCH_STOP_'+modelName:
      const b = state;
      b.isCelluarActive = false;
      return {...b};
    case 'ADD_'+modelName:
        return {...state};
    case 'STOP_'+modelName:
      return {...state, isActive: false, current: state.current}
    default:
      return state;
  }
}
