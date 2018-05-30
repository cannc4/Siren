import React from 'react';
import {
  inject,
  observer
} from 'mobx-react';
import _ from 'lodash';

// CSS Imports
import '../styles/App.css';
import '../styles/Layout.css';
import '../styles/Home.css';

import {
  shaders
} from './shaders/shaders';

import {
  Surface
} from "gl-react-dom";
import {
  Node,
  Bus
} from "gl-react";

import timeLoop from "../utils/timeLoop";
import menubarStore from '../stores/menubarStore';
import rollStore from '../stores/rollStore';

class Canvas extends React.Component {
  // getParameterSafe(parameterName, defaultValue, store) {
  //   return (store.value !== undefined ?
  //     (store.value[parameterName] !== undefined ?
  //       store.value[parameterName]
  //       :
  //       defaultValue)
  //     : (defaultValue));
  // }
  
  render() {
    const { time, res, rollStore } = this.props;

    // decay variables
    rollStore.decayEvolutionMatrices();

    // sample parameters
    let nameAscii = _.map(_.split(_.toLower(rollStore.value !== undefined ? rollStore.value.s : ""), '', 5), (c) => { return c.charCodeAt(0) });

    // pass rms information to shader
    let rmsArray = _.fill(Array(2), 0);
    _.each(menubarStore.rmsArray, (e, i) => { 
      rmsArray[i] = e.rms;
    });

    // flatten evolution matrices
    let evol = _.fill(Array(4), []);
    _.each(rollStore.evolutions, (e, i) => { 
      evol[i] = _.flatten(e.valueOf());
    });
    
    return <Node
      shader={shaders.marchGL}
      uniforms={{
        res,
        nameAscii,
        time: time / 1000,
        // rmss: rmsArray,
        evolutions: evol,
      }}
    />;
  }
}


// Time shaders
const BarrelBlur = ({ children: t, time}) =>
  <Node shader={shaders.barrelBlur}
    uniforms={{
      texture: t,
      time: time / 1000,
      amount: 0.04
    }} />;
const FXShake = ({ children: t, time }) =>
  <Node shader={shaders.shake}
    uniforms={{
      texture: t,
      time: time / 1000,
      amount: 0.01
    }} />;
const PixelRolls = ({ children: t, time }) =>
  <Node shader={shaders.rolls}
    uniforms={{
      texture: t,
      time: time / 1000,
      pixels: [100, 10],
      rollRate: 2,
      rollAmount: 0.08
    }} />;  
// Shaders without the time
const Patches = ({ children: t }) =>
    <Node shader={shaders.patches}
      uniforms={{
        texture: t,
        row: 0.5,
        col: 0.5
      }} />;
const FXRGBShift = ({ children: t }) =>
  <Node shader={shaders.rgbShift}
    uniforms={{
      texture: t,
      amount: 0.,
      angle: 3.14
    }} />;
const Edge = ({ children: t }) =>
  <Node shader={shaders.edge}
    uniforms={{
      texture: t
    }} />;
const Glow = ({ children: t }) =>
  <Node shader={shaders.glow}
    uniforms={{
      texture: t,
      brightness: 0.25
    }} />;
const Halftone = ({ children: t }) =>
  <Node shader={shaders.halftone}
    uniforms={{
      texture: t,
      pixelsPerRow: 80
    }} />;
const Mirror = ({ children: t }) =>
    <Node shader={shaders.mirror}
      uniforms={{
        texture: t,
        dir: 1
      }} />;
    
const Pixelate = ({ children: t }) =>
  <Node shader={shaders.pixelate}
  uniforms={{
    texture: t,
    pixels: [100, 10]
  }} />;


const CanvasLoop = timeLoop(Canvas);
const FXShakeLoop = timeLoop(FXShake);
const BarrelBlurLoop = timeLoop(BarrelBlur);
const PixelRollsLoop = timeLoop(PixelRolls);

@inject('rollStore')
@observer
export default class Graphics extends React.Component {
  render() {
    let dim = this.props.rollStore.dimensions_g;
    return (
      <Surface width={dim[0]} height={dim[1]}>
        <Bus ref='main'>
        <CanvasLoop
          res={[dim[0], dim[1]]}
          rollStore={this.props.rollStore} />
        </Bus>
          {/* <FXShakeLoop> */}
            {/* <BarrelBlurLoop> */}
        {/* <Edge> */}
        {/* <Halftone> */}
        {/* <Glow> */}
        {/* <Patches> */}
        {/* <Mirror> */}
        {/* <Pixelate> */}
        {/* <PixelRollsLoop> */}
        <FXRGBShift>
          {() => this.refs.main}
        </FXRGBShift>  
          {/* </PixelRollsLoop> */}
          {/* </Pixelate> */}
          {/* </Mirror> */}
          {/* </Patches> */}
          {/* </Glow> */}
          {/* </Halftone> */}
            {/* </Edge> */}
            {/* </BarrelBlurLoop> */}
          {/* </FXShakeLoop> */}
      </Surface>     
    );
  }
}