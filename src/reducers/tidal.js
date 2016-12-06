const modelName = 'TIDAL';
const INITIAL_STATE = { isActive: false, commands: [] };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      const tidal = action.payload
      return tidal;
    default:
      return state;
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> f11274bc050684cbf718294e778b1fb450c37ce1
