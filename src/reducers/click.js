const modelName = 'CLICK';
<<<<<<< HEAD
const INITIAL_STATE = {flag:0, times:1, current:0 , isActive:false};
=======
const INITIAL_STATE = {flag:0, times:2, current:0 , isActive:false};
>>>>>>> 00949fff56e6baaa0c2ade94c7f617d8caea4ec3
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INC_'+modelName:
      const k = state;
      k.flag++;
      if(k.isActive === true){
        if(k.flag%k.times===0){
          k.current = k.current+1;
        }
      }
      return {...k};
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
    default:
      return state;
  }
}
