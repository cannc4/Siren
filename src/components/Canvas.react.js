import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import io from 'socket.io-client';

import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketches/tempo';

import './style/Home.css';
import './style/Layout.css';

import { consoleSubmit, resetClick, sendScPattern, saveScBootInfo } from '../actions'

class Canvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket_sc: io('http://localhost:3006/'),  // Port 3005 is skipped because
      trigger_msg: {},                          // a HTC Vive process is using it
      resolution: 12,
      cycles: 8,
      reload: false,
      play: false
    }
  }
  
  componentDidMount() {
    const ctx = this;
    const { socket_sc } = ctx.state;

    socket_sc.on('connect', (reason) => {
      console.log("connect: ", reason);
      store.dispatch(saveScBootInfo({boot: 1, tidalMenu: true}));
    });
    socket_sc.on('disconnect', (reason) => {
      console.log("connect: ", reason);
      store.dispatch(saveScBootInfo({boot: 0, tidalMenu: false}));
    });
    socket_sc.on("/sclog", data => {
      ctx.setState({trigger_msg: data.trigger});

      // console.log("SCLog: ", data.trigger);
      if(_.startsWith(data.trigger, 'SIREN')) {
        store.dispatch(saveScBootInfo({boot: 1, tidalMenu: true}));
      }
    })
  }

  updateDimensions() {
    const element = document.getElementById('canvasLayout');
    if(element && element !== null){
      const w = element.clientWidth;
      const h = element.clientHeight;

      // -25 (header) -3 (borders) -24 (controls) -1 border
      return {w: w, h: h-53};
    }
  }

  render() {
    const ctx = this;

    const handleClickPlay = event => {
      ctx.setState({play: true})
  
      store.dispatch(resetClick());
      store.dispatch(consoleSubmit(ctx.props.serverLink, "hush"));
      store.dispatch(sendScPattern(ctx.props.serverLink, "OSCFunc.trace(false);"));
    }
    const handleClickPause = event => {
      ctx.setState({play: false})  
      store.dispatch(sendScPattern(ctx.props.serverLink, "OSCFunc.trace(true);"));
    }

    let dimensions = ctx.updateDimensions();
    return (<div className={"Canvas draggableCancel"}>
      <div className={'CanvasControls'}>
        <button className={'Button'} onClick={undefined}> Edit </button>
        <div>Cycles: <input className={'Input'} 
                            placeholder={8}
                            onChange={(e) => {ctx.setState({cycles: _.toInteger(e.target.value)})}}/></div>
        <div>Resolution: <input className={'Input'}
                                placeholder={12} 
                                onChange={(e) => {ctx.setState({resolution: _.toInteger(e.target.value)})}}/></div>
        <button className={"Button"} onClick={(e) => {ctx.setState({reload: true}); 
                                                      _.delay(() => {ctx.setState({reload:false})}, 50)}
                                              }>⭯</button>
      </div> 
      <div className={'CanvasSketch'}>
        <P5Wrapper sketch={sketch}
                  width={dimensions ? dimensions.w: 600}
                  height={dimensions ? dimensions.h: 90}
                  resolution={ctx.state.resolution ? ctx.state.resolution : 12}
                  cycles={ctx.state.cycles ? ctx.state.cycles : 8}
                  reload={ctx.state.reload}
                  play={ctx.state.play}
                  activeMatrix={ctx.props.activeMatrix}
                  message={ctx.state.trigger_msg}
                  serverLink={ctx.props.serverLink}/>
      </div>
    </div>);
  }
}
export default connect(state => state)(Canvas);
