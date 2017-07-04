const modelName = 'GLOBAL';
const INITIAL_STATE = { globalTransformations: '', globalCommands: '', storedGlobals: [{}], storedPatterns:[]};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_'+modelName:
      const p = state;
      p.globalTransformations = action.tranform;
      p.globalCommands = action.command;
      return {...p}
    case 'STORE_'+modelName:
      const g = state;
      g.storedGlobals = action.storedGlobals;
      g.storedGlobals = action.storedPatterns;
      return {...g}
    default:
      return state;
  }
}
