const modelName = 'CHANNEL';
const INITIAL_STATE = { name: '', type: null, values: [], step: 8 };
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CREATE_'+modelName:
      const p = state;
      return {...p}
    case 'UPDATE_'+modelName:
      const g = state;
      return {...g}
    default:
      return state;
  }
}
