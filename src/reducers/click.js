const modelName = 'CLICK';
const INITIAL_STATE = {flag:0, times: 1, current:0 , isActive:false, isExecuted: false};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INC_'+modelName:
      const k = state;
      console.log('...');
      if (k.isActive === true){
        k.flag++;
        if (k.flag % k.times === 0){
          k.current += 1;
          k.isExecuted = false;
        }
      }
      return {...k};
    case 'SEEK_'+modelName:
        const l = state;
        l.current = action.payload;
        return {...l};
    case 'EXECUTION_'+modelName:
      const a = state;
      a.isExecuted = true;
      return {...a};
    case 'STOP_'+modelName:
      const z = state;
      z.isActive = false;
      z.current = z.current;
      z.flag = z.flag;
      return {...z};
    case 'TOGGLE_'+modelName:
      const j = state;
      j.isActive = !j.isActive;
      return {...j};
    case 'RESET_'+modelName:
      const b = state;
      b.isActive = false;
      b.current = 0;
      b.flag = 0;
      return {...b};
    default:
      return state;
  }
}
