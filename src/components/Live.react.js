import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

import { initMyTidal,sendScPattern, sendSCMatrix, sendPatterns,createTimer,timerThread,
      startTimer, pauseTimer, stopTimer,updateTimerduration,startIndividualTimer,stopIndividualTimer,pauseIndividualTimer,
      consoleSubmit, fbcreateMatrix, fbdelete,fborder, fetchModel, updateMatrix,assignTimer,
      startClick,stopClick, changeUsername,continousPattern} from '../actions'

import {Layout, LayoutSplitter} from 'react-flex-layout';
import NumberEditor from 'react-number-editor';
import Simple from './Simple.react';
import Patterns from './Patterns.react';
import Firebase from 'firebase';
import store from '../store';
import _ from 'lodash';
var options = {
    mode: 'elm',
    theme: 'base16-light',
    fixedGutter: true,
    scroll: true,
    styleSelectedText:true,
    showToken:true,
    lineWrapping: true,
    showCursorWhenSelecting: true
};


class Live extends Component {
  constructor(props) {
    super(props);
    this.state={
      modelName : "Matrices",
      isCanvasOn: true,
      scenes: []
    }
  }
  componentDidMount(props,state){
    const ctx = this;
    const {scenes} = ctx.state;
    const { tidal, timer, click } = ctx.props;
    const { patterns, isCanvasOn } = ctx.props;
    const items = ctx.props[ctx.state.modelName.toLowerCase()];

    _.each(items, function(d){
      scenes.push(d);
      console.log("D PUSHED" + scenes);
    })
    //ctx.setState({scenes:scenes});
  }

  render(){

  const ctx = this;
  const {scenes} = ctx.state;
  const { tidal, timer, click } = ctx.props;
  const { patterns, isCanvasOn } = ctx.props;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];


  return <div>
    <div className={"Home cont"}>
    {ctx.state.isCanvasOn && <Simple width={window.innerWidth} height={window.innerHeight} timer={timer}/>}
    </div>
  </div>
  }
}
export default connect(state => state)(Live);
