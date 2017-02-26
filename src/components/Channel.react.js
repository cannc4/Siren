import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';
import Cell from './Cell.react';

class Channel extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  shouldComponentUpdate(nextProps, nextState){
    
  }

  renderStep(boslu, i) {
    const ctx=this;
    const { timer, click, commands, steps, values, channel, index }=ctx.props;

    const setText=({ target: { value }}) => {
        if (values[channel] === undefined) values[channel]={}
        values[channel][i+1] = value;
        this.props.setter({values});
    }

    const getValue = () => {
      if (values[channel] === undefined || values[channel][i+1] === undefined)
        return ''
      return values[channel][i+1];
    }

    //Timer Check
    const currentStep = ctx.props.timer.timer[index].current % steps;
    var individualClass = "playbox";
    if (i === currentStep) {
      individualClass += " playbox-active";
    }

    return <Cell className={individualClass} key={i} name={i} cellHeight={85/steps+'vh'} textval={getValue()} setText={setText}/>;
  }

  render() {
    return (
      <div className={"Player"}>
        <div className="playbox playbox-cycle" key={this.props.channel}>
        {this.props.channel}
        <input className="durInput" id={this.props.channel}
          value={this.props.timer.timer[this.props.index].duration}
          onChange={this.props.onChange} onKeyPress={this.props.onKeyPress}/>
        </div>
        {_.map(Array.apply(null, Array(this.props.steps)), this.renderStep.bind(this))}
      </div>
    );
  }

}

export default connect(state => state)(Channel);
