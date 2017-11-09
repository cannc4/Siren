
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';

import {sendPatterns, setExecution, fbupdatechannelinscene, updateCell,sendScPattern} from '../actions';

class Cell extends Component {
  constructor(props) {
    super(props)
    this.state = {
        modelName : 'Cell',
        value: '',
        c_key:'',
        tidalServerLink: 'localhost:3001',
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

  submitKey = (event) => {

    const ctx = this;
    const {tidalServerLink, value} = ctx.state;
    const { click } = ctx.props;
    const channel = ctx.props.item;

    if(event.keyCode === 13 && event.ctrlKey){
      let scenePatterns;
      _.each(ctx.props.matrices, function(d){
        if(d.matName === ctx.props.active){
          scenePatterns = d.patterns;
        }
      })

      let stepvalue = value;
      if (stepvalue !== ""){
        store.dispatch(setExecution());
        store.dispatch(sendPatterns(tidalServerLink, channel, value,
          scenePatterns, click, ctx.props.globalparams));
        ctx.executionCss(event) ;
      }
      else if (ctx.props.sccommand.scpat !== ""){
        ctx.sendScPattern(tidalServerLink,ctx.props.sccommand.scpat);
      }
    } 
  }

  executionCss(event, duration = 500) {
    event.persist();
    event.target.className += ' Executed';
    _.delay(function(){ _.replace(event.target.className, ' Executed', ''); },
            duration);
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
    const focusCell = ({ target: { value }}) => {
      const ctx = this;  
      ctx.nameInput.focus();
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
                onClick={focusCell}
                onKeyDown={ctx.submitKey.bind(ctx)}/>
      </div>
  }
}
// another React Performance
// import debugRender from 'react-render-debugger';
export default connect(state => state)(Cell);
