import React from 'react';
import { inject, observer } from 'mobx-react';
import '../styles/App.css';
import '../styles/Home.css';
import '../styles/Layout.css';
import Knob from 'react-canvas-knob';

@inject('controllerStore')
@observer
export default class Controller extends React.Component {
    
  changeValue = (val) => {
      console.log("KNOB VAL:", val);
      this.props.controllerStore.changeVal(val);
  }

  render() {
    

    //create a component for param visualizer -> name + knob 
    console.log("RENDER ``Controller.js");
    let ctx = this;
    return (<div className={'PanelAdjuster draggableCancel'}>
     {/* {this.props.controllerStore.params
                .map((p, i) => {
                  <Knob
                  value={p.value}
                  onChange={this.changeValue}
                />
                p.name;
                })}
      */}
    </div>)
  }
}      
