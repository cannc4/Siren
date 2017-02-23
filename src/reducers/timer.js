const modelName = 'TIMER';
const INITIAL_STATE ={timer :[]};
export default (state = INITIAL_STATE, action) => {
  const _timer =  { id: action.payload, duration: action.duration,  isActive: false,  current: 0};
  switch (action.type) {
    case 'CREATE_'+modelName:
      const s = state;
      s.timer[action.payload] = _timer;
      return {...s};
    case 'INC_'+modelName:
      const k = state;
      console.log("GTTIGG");
      k.timer[action.payload].current++;
      k.timer[action.payload].isActive = true;
      return {...k};
    case 'UPDATE_'+modelName:
      const b = state;
      b.timer[action.payload].duration = action.duration;
      return {...b};
    case 'ADD_'+modelName:
      return {...state};
    case 'PAUSE_'+modelName:
      const p = state;
      p.timer[action.payload].isActive = false;
      return {...p}
    case 'STOP_'+modelName:
      const stp = state;
      stp.timer[action.payload].isActive = false;
      stp.timer[action.payload].current = 0;
      return {...stp}
    default:
      return state;
  }
}
