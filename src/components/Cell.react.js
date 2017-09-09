
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

  // shouldComponentUpdate = (nextProps, nextState) => {
  //   if(nextState.value !== this.state.value) {
  //     return true;
  //   }
  //   else if(nextProps.currentStep === nextState.index ||
  //           nextProps.currentStep === this.state.index+1 ||
  //           nextProps.currentStep === 0) {
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }
  // }

//   componentWillUpdate(nextProps, nextState){
//     if(nextProps.currentStep === nextState.state.index){
//        this.setState({ className : 'playbox-active'});
//         //ctx.setState({isActive: true});
//     }
//     else{
//         console.log("here2");
//         this.setState({ className : 'playbox'});
//     }
//   }
// componentWillUpdate(nextProps, nextState) {
//     // only update chart if the data has changed
//     if (nextProps.currentStep === nextState.index) {
//         this.setState({className : 'playbox' });
//     }
//     if (nextProps.currentStep !== this.state.index) {
//         this.setState({className : 'playbox-active' });
//     }
//   }

// componentDidUpdate(prevProps, prevState) {
    // const ctx = this;
    // const {className} = ctx.state;
    //
    // ctx.setState({className:ctx.props.cssname});
// }
  render() {
    const ctx = this;
    const setText = ({ target: { value }}) => {
      const c_cell = { cell_value: value, cid: ctx.state.cid, c_key: ctx.state.c_key, cell_index: ctx.state.index, channels: ctx.props.channel };
      store.dispatch(updateCell(c_cell));
      var val = ctx.props.cell.vals;
      var newArr = [];
      for(var i = 0; i < ctx.props.item.step; i++)
      {
          newArr[i] = val[ctx.state.cid][i];
      }

      const nc = { vals: newArr, key: ctx.state.c_key };
      ctx.setState({value: value});
      fbupdatechannelinscene('Matrices', nc, ctx.state.s_key);
    }
    const tests = ({ target: { value }}) => {
      this.nameInput.focus();
    }

    var className = ctx.state.className;
    if(ctx.props.currentStep === ctx.state.index){
      className += '-active'
    }
    if(_.indexOf(ctx.props.cell.selectedCells, ctx.state.cid+"_"+ctx.state.index) >= 0) {
      className += ' selected';
    }
    return <div key={(ctx.state.c_key +'_'+ctx.state.index).toString()}>
      <textarea ref={(input) => { this.nameInput = input; }}
                className={className + " draggableCancel"} type="text"
                value={ctx.state.value}
                onChange={setText}
                onClick={tests}/>
      </div>
  }
}

export default connect(state => state)(Cell);
