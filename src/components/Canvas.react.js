import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import io from 'socket.io-client';

import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketches/tempo';

import './style/Layout.css';

import { saveScBootInfo ,fbcreateseq} from '../actions'

class Canvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      params: {},
      bitmap:[[]],
      uid:'',
      socket_sc: io('http://localhost:3006/'),  // Port 3005 is skipped because
      trigger_msg: {}                           // a HTC Vive process is using it
    }
  }
  // const handleChange = (editor, metadata, value) => {
  //   // parse pattern for parameters
  //   // write into database
  //   const payload = { key: dbKey };
  //   payload['pattern'] = value;
  //   payload['params'] = ctx.state.params;
  //   _.each(Object.values(ctx.props["Seq"]), function(d){
  //     if(d.uid === ctx.props.uid){
  //       ctx.setState({sceneKey: d.key});
  //       fbupdatepatterninscene('Matrices', payload, d.key)
  //     }
  //   })
  // }
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
 

  addSeq() {
    let flag = false;
    const ctx = this
    const {bitmap, params, name,uid} = ctx.state;
    if (name.length >= 1) {
      const sq = {bitmap:bitmap,params:params,name:name};
      let seq = Object.values(ctx.props["SEQ"]);  
      console.log(seq);
      fbcreateseq('SEQ', sq, d.uid)
    }
    else {
      alert("Sequence title should contain at least 1 character.");
    }
    
    // if(!flag) {
    //   const size = Object.keys(ctx.props["Accounts"]).length;
    //   if(size < 0)
    //     alert("A user needs to be active to add pattern.");
    // }
  }

  updateDimensions() {
    const element = document.getElementById('canvasLayout');
    if(element && element !== null){
      const w = element.clientWidth;
      const h = element.clientHeight;

      return {w: w, h: h-25};
    }
  }

  changeName({target: { value }}) {
    const ctx = this;
    ctx.setState({ name: value });
  }
  render() {
    const ctx = this;
    const {bitmap, params, name, uid} = ctx.state;
    const changeName = ctx.changeName.bind(ctx);

    let dimensions = ctx.updateDimensions();

    return (<div className={"draggableCancel"}>
    <div className={'PatternItem PatternItemInputs'}>
      <input className={'Input draggableCancel'} type="text" placeholder={'New Sequence Name'} value={name} onChange={changeName}/>
    <button className={'Button draggableCancel'} onClick={ctx.addSeq.bind(ctx)}>Add</button>
    </div>
      <P5Wrapper sketch={sketch}
                 width={dimensions ? dimensions.w: 600}
                 height={dimensions ? dimensions.h: 90}
                 activeMatrix={ctx.props.activeMatrix}
                 message={ctx.state.trigger_msg}
                 serverLink={ctx.props.serverLink}/>
    </div>);
  }
}
export default connect(state => state)(Canvas);
