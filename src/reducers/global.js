const modelName = 'GLOBAL';
const INITIAL_STATE = { globalTransformations: '', globalCommands: '' };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_'+modelName:
    const p = state;
    p.globalCommands = action.command;
    p.globalTransformations = action.tranform;
    console.log(p);
    return {...p}
    default:
      return state;
  }
}
