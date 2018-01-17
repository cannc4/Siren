import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import io from 'socket.io-client';

import './style/Home.css';
import './style/Layout.css';

import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketches/tempo';
// import vis_sketch from './sketches/tempo';

import GL from "gl-react";
import GLReactDOM from "gl-react-dom";
import { consoleSubmit, resetClick, sendScPattern, saveScBootInfo, startProcessing } from '../actions'

class Canvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket_sc: io('http://localhost:3006/'),  // Port 3005 is skipped because
      trigger_msg: {},                          // a HTC Vive process is using it
      resolution: 12,
      cycles: 8,
      reload: false,
      play: false,
      content: 0,
      maxContent: 3, // 0-vis, 1-shader1, 2-shader2
      isEditor: false
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
      console.log("disconnect: ", reason);
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

    // SINGLE MESSAGE STRUCTURE
    // {time, args}

    // STACK MESSAGE STRUCTURE
    // 0: Array(2)
    //   0:
    //     s: "hh"
    //     t: Array(1)
    //       0:
    //         cycle: 902,
    //         delta: 0.5,
    //         time: 901.41357317311

    let msg = ctx.state.trigger_msg;
    // console.log(msg);
    let time = msg['time'] !== undefined ? msg['time'] : 0;
    let rate = Math.sin(time)/2; //msg['cycleInfo'] !== undefined ? _.toNumber(msg['cycleInfo']['delta']) : 0.5;
    let depth = msg['cycleInfo'] !== undefined ? _.toNumber(msg['cycleInfo']['delta']) : 0.5;

    const shaders = GL.Shaders.create({
      blobby: {
        frag: `
          precision highp float;

          uniform float time;
          uniform vec2 resolution;
          uniform float depth;
          uniform float rate;

          #define N 16

          void main( void ) {
            vec2 v = (gl_FragCoord.xy-(resolution*0.5))/min(resolution.y,resolution.x)*10.0;
            float t = time * 0.3,r=2.0;
            for (int i=1;i<N;i++){
              float d = (3.14159265 / float(N))*(float(i)*14.0);
              r += length(vec2(rate*v.y,rate*v.x))+1.21;
              v = vec2(v.x+cos(v.y+cos(r)+d)+cos(t),v.y-sin(v.x+cos(r)+d)+sin(t));
            }
            r = (sin(r*0.09)*0.5)+0.5;
            r = pow(r, depth);
            gl_FragColor = vec4(r,pow(max(r-0.55,0.0)*2.2,2.0),pow(max(r-4.875,0.1)*3.0,6.0), 1.0 );
          }`

      },
      sinewave: {
        frag: `
          precision highp float;

          uniform float time;
          uniform vec2 resolution;
          uniform vec2 colorMult;
          uniform float coeffx;
          uniform float coeffy;
          uniform float coeffz;

          void main( void ) {

          	vec2 position = gl_FragCoord.xy / resolution.xy;

          	float color = 0.0;
          	color += sin( position.x * cos( time / 15.0 ) * 10.0 )  +  cos( position.y * cos( time / 15.0 ) * coeffx );
          	color += sin( position.y * sin( time / 10.0 ) * coeffz )  +  cos( position.x * sin( time / 25.0 ) * coeffy );
          	color += sin( position.x * sin( time / 50.0 ) * coeffx )  +  sin( position.y * sin( time / 35.0 ) * coeffz );

          	color *= sin( time / 10.0 ) * 0.5;

          	float r = color;
          	float g = color * colorMult.y;
          	float b = sin( color + time / 2.0 ) * colorMult.x;

          	gl_FragColor = vec4(r, g, b, 1.0 );

          }`
      }
    });
    const Blobby = GL.createComponent(
      ({ time, resolution, depth, rate }) =>
      <GL.Node
        shader={shaders.blobby}
        uniforms={{ time, resolution, depth, rate }}
      />
     );
    const Sinewave = GL.createComponent(
       ({ time, resolution, colorMult, coeffx, coeffy, coeffz }) =>
       <GL.Node
         shader={shaders.sinewave}
         uniforms={{ time, resolution, colorMult, coeffx, coeffy, coeffz }}
       />
      );
    
    // TODO: 
    // Listen to sketch window events to toggle `isEditor`
    const handleClickProcessing = event => {
      const ctx = this;
      if(!ctx.state.isEditor) {
        console.log("Interpreting Editor");
        store.dispatch(startProcessing("localhost:3001"));
        ctx.setState({isEditor: true});
      }
    }
    const handleClickChange = event => {
      ctx.setState({content: (ctx.state.content+1) % ctx.state.maxContent});      
    }

    let dimensions = ctx.updateDimensions();
    let width = dimensions ? dimensions.w: 600;
    let height = dimensions ? dimensions.h: 90;
    const {Surface} = GLReactDOM;    
    return (<div className={"Canvas draggableCancel"}>
      <div className={'CanvasControls'}>
        <button className={'Button'} onClick={handleClickChange} > {"Change Content ("+ctx.state.content + ")"} </button>
        <button className={'Button'} onClick={handleClickProcessing} > {"Editor"} </button>
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
        {ctx.state.content === 0 && 
        <P5Wrapper sketch={sketch}
                  width={dimensions ? dimensions.w: 600}
                  height={dimensions ? dimensions.h: 90}
                  resolution={ctx.state.resolution ? ctx.state.resolution : 12}
                  cycles={ctx.state.cycles ? ctx.state.cycles : 8}
                  reload={ctx.state.reload}
                  activeMatrix={ctx.props.activeMatrix}
                  message={ctx.state.trigger_msg}/>}
        {ctx.state.content === 1 && 
        <Surface width={width}
                 height={height}>
          <Sinewave time={time}
                    resolution={[width, height]}
                    colorMult={[depth*5, 2-depth*2]}
                    coeffx={15*(Math.sin((Math.cos(time)+1)*2)+1)}
                    coeffy={3.53*(Math.tan(Math.sqrt(time)*1.4362)+1)+5*(Math.cos(time)+1)}
                    coeffz={10.0}/>
        </Surface>}
        {ctx.state.content === 2 && 
        <Surface width={width}
                 height={height}>
          <Blobby time={time}
                    resolution={[width, height]}
                    depth={depth}
                    rate={rate}/>
        </Surface>}
      
      </div>
    </div>);
  }
}
export default connect(state => state)(Canvas);
