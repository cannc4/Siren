import _ from 'lodash';
import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('rollStore')
@observer
export default class Canvas extends React.Component {

  updateDimensions() {
    const element = document.getElementById('canvasLayout');
    if(element && element !== null){
      const w = element.clientWidth;
      const h = element.clientHeight;

      // -25 (header) -3 (borders) -24 (controls) -1 border
      return {w: w, h: h-53};
    }
    return { w: 800, h: 190 };
  }

  componentDidMount() {
    let getMousePos = (cn, evt) => { 
      var rect = cn.getBoundingClientRect();
      return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
      }
    };
    // get HTML canvas 
    var can = document.getElementById("d3_visualizer");
    can.addEventListener('mousemove', (evt) => {
        let mousePos = getMousePos(can, evt);
        this.props.rollStore.updateMouse(mousePos.x, mousePos.y);
    }, false);
    can.addEventListener('mousedown', (evt) => {
        this.props.rollStore.updateMouseEvent('drag');
    }, false);
    can.addEventListener('mouseup', (evt) => {
        this.props.rollStore.updateMouseEvent('idle');
    }, false);

    this.props.rollStore.initD3();
  }

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
            this.props.rollStore.reloadRoll(true);
            _.delay(() => { this.props.rollStore.reloadRoll(false) }, 50)
          }
          }>⭯</button>
      </div>

      <div className={'CanvasSketch'}>
        <div id="d3_visualizer"></div>  
      </div>
    </div>);
  }
}
