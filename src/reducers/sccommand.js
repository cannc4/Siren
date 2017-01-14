const modelName = 'SCCOMMAND';
const INITIAL_STATE = { commands: [] };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'FETCH_'+modelName:
      state.commands.push(action.payload)
      return state;
    default:
      return state;
  }
}
