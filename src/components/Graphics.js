import React from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

// CSS Imports
import '../styles/App.css';
import '../styles/Layout.css';
import '../styles/Home.css';

import { shaders } from './shaders/simple';

import { Surface } from "gl-react-dom";
import { Shaders, Node, GLSL, Bus, Uniform } from "gl-react";

import timeLoop from "../utils/timeLoop";
import menubarStore from '../stores/menubarStore';

class Canvas extends React.Component {
  getParameterSafe(parameterName, defaultValue, store) {
    return (store.value !== undefined ?
      (store.value[parameterName] !== undefined ?
        store.value[parameterName]
        :
        defaultValue)
      : (defaultValue));
  }
  
  render() {
    const { time, res, rollStore} = this.props;

    // sample parameters
    let nameAscii = _.map(_.split(_.toLower(rollStore.value !== undefined ? rollStore.value.s : ""), '', 5), (c) => { return c.charCodeAt(0) });
    let note = this.getParameterSafe('n', 0, rollStore);
    let cps = this.getParameterSafe('cps', 1, rollStore);
    let delta = this.getParameterSafe('delta', 1, rollStore);
    let cycle = this.getParameterSafe('cycle', 1, rollStore);
    let sustain = this.getParameterSafe('sustain', 1, rollStore);
    let begin = this.getParameterSafe('begin', 0, rollStore);
    let end = this.getParameterSafe('end', 1, rollStore);
    let room = this.getParameterSafe('room', 1, rollStore);
    let gain = this.getParameterSafe('gain', 1, rollStore);
    let channel = this.getParameterSafe('sirenChan', 0, rollStore);

    // pass rms information to shader
    let rmsArray = _.fill(Array(10), 0);
    _.each(menubarStore.rmsArray, (e, i) => { 
      rmsArray[i] = e.rms;
    });
  
    return <Node
      shader={shaders.marchGL}
      uniforms={{
        res,
        time: time / 1000,
        rmss: rmsArray,
        nameAscii,
        note,
        // cps,
        // delta,
        cycle,
        // sustain,
        // begin,
        // end,
        // room,
        // gain,
        // channel
      }}
    />;
  }
}

const CanvasLoop = timeLoop(Canvas);

export const FX_Shake = ({ children: t, time }) =>
  <Node shader={shaders.shake}
    uniforms={{
      texture: t,
      time: time / 1000,
      amount: 0.01
    }} />;

const FX_ShakeLoop = timeLoop(FX_Shake);

export const FX_RGBShift = ({ children: t }) =>
  <Node shader={shaders.rgbShift}
    uniforms={{
      texture: t,
      amount: 0.005,
      angle: 3.14
    }} />;

@inject('rollStore')
@observer
export default class Graphics extends React.Component {
  render() {
    console.log("RENDER GRAPHICS");

    let dim = this.props.rollStore.dimensions;
    return (
      <Surface width={dim[0]} height={dim[1]}>
        <Bus ref='main'>
          <CanvasLoop res={[dim[0], dim[1]]} rollStore={this.props.rollStore}/>
        </Bus>
        <FX_RGBShift>
          <FX_ShakeLoop>
            {() => this.refs.main}
          </FX_ShakeLoop>
        </FX_RGBShift>  
      </Surface>     
    );
  }
}