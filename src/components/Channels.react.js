import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fbdeletechannelinscene, fbupdatechannelinscene,
         updateChannel, deleteChannel } from '../actions';
import store from '../store';
import _ from 'lodash';

// var Button = require('react-button')
// var themeButton = {
//     style : {borderWidth: 0.8, borderColor: 'rgba(255,255,102,0.15)'} ,
//     disabledStyle: { background: 'gray'},
//     overStyle: { background: 'rgba(255,255,102,0.15)' },
//     activeStyle: { background: 'rgba(255,255,102,0.15)' },
//     pressedStyle: {background: 'green', fontWeight: 'bold'},
//     overPressedStyle: {background: 'rgba(255,255,102,1)', fontWeight: 'bold'}
// }
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

  changeType({target: { value }}) {
    const ctx = this;
    ctx.setState({ type: value });
  }

  renderStep(item, _, i) {
    const ctx = this;

    // console.log("RenderStep ("+i+") :" , ctx.props);

    const { step } = ctx.state;
    const { click, active } = ctx.props;
    const channels = Object.values(ctx.props.channel)

    const setText=({ target: { value }}) => {
      item.vals[i] = value;

      const nc = { vals: item.vals,
                   key: item.key };

      fbupdatechannelinscene('Matrices', nc, ctx.props.scene_key)
    }

    const currentStep = click.current % step;

    const playerClass="Player Player--" + (step) + "rows";
    return <div key={(item['scene']+item['name']+i).toString()} className={playerClass}>
      <textarea type="text" value={item.vals[i]} onChange={setText}/>
    </div>
  }

  renderItem(item) {
    const ctx = this;

    if (item.scene !== ctx.props.active)
      return;

    const deleteChannel = event => {
      // console.log("DELETE CHANNEL EVENT: ", event);

      if (confirm('Are you sure you want to delete this channel?')) {
        // TODO item.key olmayacak sanirim
        var sth_else = item.key

        fbdeletechannelinscene('Matrices', ctx.props.scene_key, item.key)
      // // re-order all items after deleting successfull
      // Firebase.database().ref("/matrices").once('child_removed').then(function(oldChildSnapshot) {
      //   const items = ctx.props[ctx.state.modelName.toLowerCase()];
      //   ctx.setState({sceneIndex: (Object.values(items).length)});
      //   _.forEach(Object.values(items), function(d, i){
      //     fborder(ctx.state.modelName, {matName: d.matName, patterns: d.patterns, values: d.values, sceneIndex: i}, d.key);
      //   });
      // }, function(error) {
      //   console.error(error);
      // });
      }
    }
    const updateTransition = ({target : {value}}) => {
      const ctx = this;

      item.transition = value

      const nc = { transition: value,
                   key: item.key };

      fbupdatechannelinscene('Matrices', nc, ctx.props.scene_key)
    }

    console.log("renderItem: ", item);

    const step = parseInt(item.step);
    const playerClass = "Player"

  //  ctx.setState({name:item.name, type:item.type, step: item.step, transition:item.transition, vals:[]})
    //store.dispatch(updateChannel(item));
    // if Item is legit by key, it will be shown
    // parameters can be added
    return item && (
      <div key={(item['scene']+item['name']).toString()} className={playerClass}>
        <div><button onClick={deleteChannel}>{'x'}</button>
        <p>{'  '+item.name}</p></div>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
        <input className = "playbox"
          placeholder={" - "}  value = {item.transition}
          style = {{margin: 5}} onChange = {updateTransition}/>
      </div>
    )
  }

  render() {
    const ctx = this
    var items = ctx.props.channel;

    console.log('channel items: ', items);
    return (
      <div className="Player-holder">
      { _.map(items, ctx.renderItem.bind(ctx))}
      </div>
    )
  }
}

export default connect(state => state)(Channels);
