import React from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

@inject('rollStore')
@observer    
export default class PatternRoll extends React.Component {
    
    updateDimensions() {
        const element = document.getElementById('pattern_rollLayout');
        if(element && element !== null){
          const w = element.clientWidth;
          const h = element.clientHeight;
    
          // -25 (header) -3 (borders) -24 (controls) -1 border
          return {w: w, h: h-53};
        }
        return { w: 800, h: 190 };
    }
    
    componentDidMount() { 
        console.log("INIT PATTERN ROLL");
        
        let dimensions = this.updateDimensions();
        let width =  dimensions.w;
        let height = dimensions.h;
        let getMousePos = (cn, evt) => { 
            var rect = cn.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            }
        };

        // get HTML canvas 
        var can = document.getElementById("PatternRollSketch");
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

        // 
        this.props.rollStore.initCanvas(can, width, height);
        this.props.rollStore.setupCanvas(width, height);
        this.props.rollStore.updateCanvas();
    }

    render() {
        console.log("RENDER PATTERN ROLL");

        let dimensions = this.updateDimensions();
        let width =  dimensions.w;
        let height = dimensions.h;
        
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
                <canvas id="PatternRollSketch"
                    width = {_.toNumber(width)}
                    height= {_.toNumber(height)}>
                </canvas>
            </div>
        </div>);
    }
}

