const modelName = 'LAYOUT';
const INITIAL_STATE = {windows: {}};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // action.payload is the whole layout
    case 'UPDATE_'+modelName:
      const l = state;
      l.windows = action.payload;
      _.forEach(action.payload, function(panel, j)
      {
        console.log(j, l.windows[j], action.payload[j]);
        l.windows[j].x = action.payload[j].x;
        l.windows[j].y = action.payload[j].y;
        l.windows[j].w = action.payload[j].w;
        l.windows[j].h = action.payload[j].h;
        l.windows[j].minW = action.payload[j].minW;
      })
      return {...l};
    default:
      return state;
  }
}
