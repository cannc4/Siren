const modelName = 'GLOBAL';
const INITIAL_STATE = { globalTransformations: '', globalCommands: '', storedGlobals: []};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_'+modelName:
      const p = state;
      p.globalCommands = action.command;
      p.globalTransformations = action.tranform;
      return {...p}
    default:
      return state;
  }
}
