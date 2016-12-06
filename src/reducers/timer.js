const modelName = 'TIMER';
<<<<<<< HEAD
const INITIAL_STATE = { isActive: false, current: 0, isCelluarActive: false};
=======
const INITIAL_STATE = { isActive: false, current: 0 };
>>>>>>> f11274bc050684cbf718294e778b1fb450c37ce1
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INC_'+modelName:
      const s = state;
      s.isActive = true;
      s.current++;
      return {...s};
<<<<<<< HEAD
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
=======
    case 'STOP_'+modelName:
      const b = state;
      b.isActive = false;
      b.current= 0;
      return {...b};
>>>>>>> f11274bc050684cbf718294e778b1fb450c37ce1
    default:
      return state;
  }
}
