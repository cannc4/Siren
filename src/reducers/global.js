const modelName = 'GLOBAL';
const INITIAL_STATE = { globalTransformations: '', globalCommands: ''};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_'+modelName:
      const p = state;
      p.globalCommands = action.command;
      p.globalTransformations = action.tranform;
      return {...p}
    // case 'PATTERN_'+modelName:
    //   const z = state;
    //   z.patList = action.sp;
    //   console.log(action.sp);
    //   return {...z}
    default:
      return state;
  }
}
