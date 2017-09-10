// import _ from 'lodash';
const modelName = 'CELL';
const INITIAL_STATE = {vals: [[]], selectedCells:[]};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'REFINE_'+modelName:
        const p = state;
        // console.log(action.payload);
        // console.log(p.vals);
        if (action.payload.cid !== undefined){
            if(p.vals[action.payload.cid][action.payload.cell_index]=== undefined){
                p.vals[action.payload.cid][action.payload.cell_index].push(action.payload.cell_value);
            }
            else{
            p.vals[action.payload.cid][action.payload.cell_index] = action.payload.cell_value;
            }
        }
        // console.log("REFINE" + p.vals);
        return {...p};
    case 'BOOT_'+modelName:
        const d = state;
        var tempb = new Array(action.payload.cstep);
        if(d.vals[action.payload.cid]=== undefined){
            d.vals.push(tempb);
        }
        for (var i = 0; i < action.payload.cstep; i++){
            d.vals[action.payload.cid][i] =  action.payload.propedcell[i];
        }
        // console.log("BOOT" + d.vals);
        return {...d};
    case 'CREATE_'+modelName:
        const z = state;
        var b = new Array(action.payload.cstep);
        z.vals.push(b);
        for (var j = 0; j < action.payload.cstep; j++){
            z.vals[action.payload.cid][j]= "";
            if( z.vals[action.payload.cid][j] === undefined){
                z.vals[action.payload.cid][j] = '';
            }
        }
        // console.log("REFINE" + z.vals);
      return {...z};
    case 'SELECT_'+modelName:
      const e = state;
      e.selectedCells = action.payload;
      return {...e};
    default:
        return state;
  }
}
