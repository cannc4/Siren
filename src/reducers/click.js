const modelName = 'CLICK';
const INITIAL_STATE = {current:0 , isActive:false};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INC_'+modelName:
      const k = state;
      k.isActive = true;
      k.current = k.current+1;
      return {...k};
      case 'STOP_'+modelName:
      const z = state;
      z.isActive = false;
      z.current = z.current;
      return {...z};
    default:
      return state;
  }
}
