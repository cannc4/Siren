import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

import Simple from './Simple.react';
import _ from 'lodash';

// NOT USED AT THE MOMENT
class Live extends Component {
  constructor(props) {
    super(props);
    this.state={
      modelName : "Matrices",
      isCanvasOn: true,
      scenes: []
    }
  }
  componentDidMount(props,state){
    const ctx = this;
    const {scenes} = ctx.state;
    const items = ctx.props[ctx.state.modelName.toLowerCase()];

    _.each(items, function(d){
      scenes.push(d);
    })
    //ctx.setState({scenes:scenes});
  }

  render(){
    const ctx = this;

    return <div>
      <div className={"Home cont"}>
      {ctx.state.isCanvasOn && <Simple width={window.innerWidth} height={window.innerHeight} timer={timer}/>}
      </div>
    </div>
  }
}
export default connect(state => state)(Live);
