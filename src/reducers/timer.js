const modelName = 'TIMER';
const INITIAL_STATE = { isActive: false, current: 0, isCelluarActive: false, isBjorkActive: false};
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
      a.isBjorkActive = false;
      return {...a};
    case 'FETCH_STOP_'+modelName:
      const b = state;
      b.isCelluarActive = false;
      return {...b};
    case 'FETCH_2_'+modelName:
      const c = state;
      c.isCelluarActive = false;
      c.isBjorkActive = true;
      return {...c};
    case 'FETCH_STOP_2_'+modelName:
      const d = state;
      d.isBjorkActive = false;
      return {...d};
    case 'ADD_'+modelName:
      return {...state};
    case 'STOP_'+modelName:
      return {...state, isActive: false, current: 0}
    default:
      return state;
  }
}
