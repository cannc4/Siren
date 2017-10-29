const modelName = 'GLOBAL';
const INITIAL_STATE = { globalTransformations: '', globalCommands: '', globalChannels: '', storedGlobals: [{}], storedPatterns:[]};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_'+modelName:
      const p = state;
      p.globalTransformations = action.transform;
      p.globalCommands = action.command;
      p.globalChannels = action.channel;
      return {...p}
    case 'STORE_'+modelName:
      const g = state;
      g.storedGlobals = action.storedGlobals;
      g.storedPatterns = action.storedPatterns;
      return {...g}
    default:
      return state;
  }
}
