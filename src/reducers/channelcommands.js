const modelName = 'CC';
const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'SET_'+modelName:
      const ret = {...state};
      if (ret[action.payload.channel] !== action.payload.command)
          ret[action.payload.channel] = action.payload.command
      return ret;
    case 'RESET_'+modelName:
      return {};
    case 'FETCH_'+modelName:
      return state;
    default:
      return state;
  }
}
