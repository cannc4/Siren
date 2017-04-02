const modelName = 'STORE';
const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case modelName+"_PATTERN":
      const s = state;
      s.storedPattern = action.payload;
      return { ...s };
    default:
      return state;
  }
}
