import _ from 'lodash';
import React from 'react';
import { inject, observer } from 'mobx-react';
import timeLoop from '../utils/timeLoop';
import rollStore from '../stores/rollStore';

class Roll extends React.Component { 
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

const RollLoop = timeLoop(Roll);

@inject('rollStore')
@observer
export default class Canvas extends React.Component {
  render() {
    console.log("RENDER CANVAS.JS");

    return (<div className={"Canvas draggableCancel"}>
      <div className={'CanvasControls'}>
        <div>Cycles: 
          <input className={'Input'}
            placeholder={8}
            onChange={(e) => {this.props.rollStore.updateCycles(_.toInteger(e.target.value))}}/>
        </div>
        <div>Resolution: 
          <input className={'Input'} 
            placeholder={12} 
            onChange={(e) => {this.props.rollStore.updateResolution(_.toInteger(e.target.value))}}/>
        </div>
        <button className={"Button"}
          onClick={(e) => {
            this.props.rollStore.reloadRoll();
          }
          }>⭯</button>
      </div>
      <RollLoop></RollLoop>
    </div>);
  }
}