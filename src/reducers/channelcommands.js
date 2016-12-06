const modelName = 'CC';
const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
<<<<<<< HEAD
  // console.log("CHANNELCOMMMANDS ACTION");
  //   console.log("channel action: ");
  // console.log(action);
  //   console.log("channel state: ");
  // console.log(state);
=======
>>>>>>> f11274bc050684cbf718294e778b1fb450c37ce1
  switch (action.type) {
    case 'SET_'+modelName:
      const ret = {...state};
      if (ret[action.payload.channel] !== action.payload.command)
          ret[action.payload.channel] = action.payload.command
      return ret;
<<<<<<< HEAD
    case 'RESET_'+modelName:
=======
    case 'RESET'+modelName:
>>>>>>> f11274bc050684cbf718294e778b1fb450c37ce1
      return {};
    case 'FETCH_'+modelName:
      return state;
    default:
      return state;
  }
}
