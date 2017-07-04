import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fbdeletechannelinscene, fbupdatechannelinscene,
         updateChannel, deleteChannel } from '../actions';
import store from '../store';
import _ from 'lodash';

class Channels extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modelName : 'Channels',
      cid: '',
      scene_name: '',
      name: '',
      type: '',
      vals: [],
      step: 8,
      transition: ''
    }
  }

  renderStep(item, _, i) {
    const ctx = this;
    const { click, active } = ctx.props;
    const step = parseInt(item.step);
    const currentStep = click.current % step;

    const setText=({ target: { value }}) => {
      item.vals[i] = value;

      const nc = { vals: item.vals, key: item.key };
      fbupdatechannelinscene('Matrices', nc, ctx.props.scene_key)
    }

    var className = 'playbox';
    if (currentStep === i)
      className += '-active';
    return <div key={(item['scene']+item['name']+i).toString()}>
      <textarea className={className} type="text"
                value={item.vals[i]}
                onChange={setText}/>
    </div>
  }

  renderItem(item) {
    const ctx = this;

    if (item.scene !== ctx.props.active)
      return;

    const deleteChannel = event => {
      if (confirm('Are you sure you want to delete this channel?')) {
        fbdeletechannelinscene('Matrices', ctx.props.scene_key, item.key)
      }
    }
    const updateTransition = ({target : {value}}) => {
      const ctx = this;

      item.transition = value

      fbupdatechannelinscene('Matrices',
                { transition: value, key: item.key },
                ctx.props.scene_key)
    }

    const step = parseInt(item.step);
    const playerClass = "Channel"

    return item && (
      <div key={(item['scene']+item['name']).toString()} className={playerClass}>
        <div className = {"channelHeader " + item.type }>
          <button onClick={deleteChannel}>&nbsp;{'X'}</button>
          <p>&nbsp;&nbsp;{item.name}&nbsp;</p>
          <p style={{opacity:0.5}}>{"  (" + item.type+ ")"}</p>
        </div>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
        <input className = "playbox"
          placeholder={" - "}  value = {item.transition}
          onChange = {updateTransition}/>
      </div>
    )
  }

  render() {
    const ctx = this
    var items = ctx.props.channel;

    return (
      <div className="ChannelHolder">
      {_.map(items, ctx.renderItem.bind(ctx))}
      </div>
    )
  }
}

export default connect(state => state)(Channels);
