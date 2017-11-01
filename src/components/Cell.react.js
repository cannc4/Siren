
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';

import { fbupdatechannelinscene, updateCell} from '../actions';

class Cell extends Component {
  constructor(props) {
    super(props)
    this.state = {
        modelName : 'Cell',
        value: '',
        c_key:'',
        s_key:'',
        cid:'',
        className:'GridItem',
        index:''
    }
  }

  componentWillMount = () => {
    this.setState({value: this.props.item.vals[this.props.index],
                   cid: this.props.item.cid,
                   c_key:this.props.item.key,
                   index: this.props.index,
                   s_key: this.props.s_key});
  }

  render() {
    const ctx = this;
    const setText = ({ target: { value }}) => {
      const c_cell = { cell_value: value, cid: ctx.state.cid, c_key: ctx.state.c_key, cell_index: ctx.state.index};
      store.dispatch(updateCell(c_cell));
      // const sceneKey = _.findKey(ctx.props.matrices, ['matName', ctx.props.active]);
      const val = ctx.props.cell.vals;
      const nc = { vals: val[ctx.state.cid], key: ctx.state.c_key };
      ctx.setState({value: value});
      fbupdatechannelinscene('Matrices', nc, ctx.state.s_key);
    }
    const tests = ({ target: { value }}) => {
      this.nameInput.focus();
    }

    var className = ctx.state.className;
    if(ctx.props.currentStep === ctx.state.index){
      className += ' active'
    }
    if(ctx.props.index % 2 === 0) {
      className += ' even'
    }
    else {
      className += ' odd'
    }
    if(_.indexOf(ctx.props.cell.selectedCells, ctx.state.cid+"_"+ctx.state.index) >= 0) {
      className += ' selected';
    }
    return <div key={(ctx.state.c_key +'_'+ctx.state.index).toString()}>
      <textarea ref={(input) => { this.nameInput = input; }}
                className={className + " draggableCancel"} type="text"
                value={ctx.state.value}
                onChange={setText}
                placeholder={ctx.props.index % 2 === 1 ? _.toString(ctx.props.index+1) : ''}
                onClick={tests}/>
      </div>
  }
}


// another React Performance
// import debugRender from 'react-render-debugger';

export default connect(state => state)(Cell);
