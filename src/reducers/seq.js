const modelName = 'SEQ';
const INITIAL_STATE = {seq:[]};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_'+modelName:
        const k = state;
        k.seq = action.payload.seqlist;
    default:
      return state;
  }
}
