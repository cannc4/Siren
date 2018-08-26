import _ from 'lodash';
import React from 'react';
import { inject, observer } from 'mobx-react';
import timeLoop from '../utils/timeLoop';
import rollStore from '../stores/rollStore';

class RollCanvas extends React.Component { 
  render() {
    // console.log("RENDER CANVASLOOP");
    
    rollStore.value_time = this.props.time / 1000.;
    rollStore.cleanData();
    rollStore.renderCanvas();

    return (
      <div className={'CanvasSketch'}>
        <canvas id="pat_roll" width={'100'} height={'100'}></canvas>  
      </div>
    );
  }
};

const RollLoop = timeLoop(RollCanvas);

@inject('rollStore')
@observer
export default class Roll extends React.Component {
  render() {
    console.log("RENDER CANVAS.JS");

    return (<div className={"Canvas"}>
      <RollLoop></RollLoop>
    </div>);
  }
}