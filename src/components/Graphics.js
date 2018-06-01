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
import sceneStore from '../stores/sceneStore';

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

    // flatten evolution matrices
    let evol = _.fill(Array(4), []);
    _.each(rollStore.evolutions, (e, i) => { 
      evol[i] = _.flatten(e.valueOf());
    });
    
    return <Node
      shader={shaders.marchGL}
      uniforms={{
        res,
        time: time / 1000,
        nameAscii,
        evolutions: evol,
        activeSceneId: sceneStore.activeSceneId
      }}
    />;
  }
}

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
const Lines = ({ children: t }) =>
    <Node shader={shaders.lines}
    uniforms={{
      texture: t,
      lineStrength: 0.01,
      lineSize: 500,
      lineTilt: 1.6
    }} />;

// Time shaders
const BarrelBlur = ({ children: t, time}) =>
  <Node shader={shaders.barrelBlur}
    uniforms={{
      texture: t,
      time: time / 1000,
      amount: rollStore.getEvalMatItem(3, 2, 3)*0.1
    }} />;
const FXShake = ({ children: t, time }) =>
  <Node shader={shaders.shake}
    uniforms={{
      texture: t,
      time: time / 1000,
      amount: rollStore.getEvalMatItem(3, 3, 0) * 0.01
    }} />;
    const Pixelate = ({ children: t, time }) =>
    <Node shader={shaders.pixelate}
      uniforms={{
        texture: t,
        pixels: [_.toInteger(1600 / rollStore.getEvalMatItem(3, 1, 0)),
                 _.toInteger(512 / rollStore.getEvalMatItem(3, 1, 0))],
        }} />;

const CanvasLoop = timeLoop(Canvas);
const FXShakeLoop = timeLoop(FXShake);
const BarrelBlurLoop = timeLoop(BarrelBlur);
const PixelateLoop = timeLoop(Pixelate);

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
        <Lines>
          <BarrelBlurLoop>
            {/* <Patches> */}
            {/* <Halftone> */}
            {/* <Glow> */}
            {/* <Mirror> */}
            {/* <Edge> */}
              <PixelateLoop>
                <FXShakeLoop>
                  <FXRGBShift>
                    {() => this.refs.main}
                  </FXRGBShift>  
                </FXShakeLoop>
              </PixelateLoop>
            {/* </Edge> */}
            {/* </Mirror> */}
            {/* </Glow> */}
            {/* </Halftone> */}
            {/* </Patches> */}
          </BarrelBlurLoop>
        </Lines>
      </Surface>     
    );
  }
}