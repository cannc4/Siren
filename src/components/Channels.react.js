
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fbdeletechannelinscene, fbupdatechannelinscene,
         deleteChannel,sendPatterns} from '../actions';

import store from '../store';
import _ from 'lodash';
var Button = require('react-button')
var themeButton = {
    style : {borderWidth: 0.8, borderColor: 'rgba(255,255,102,0.15)'} ,
    disabledStyle: { background: 'gray'},
    overStyle: { background: 'rgba(255,255,102,0.15)' },
    activeStyle: { background: 'rgba(255,255,102,0.15)' },
    soloPressedStyle: {background: 'rgba(255,255,102,0.75)'},
    oversoloPressedStyle: {background: 'rgba(255,255,102,1)', fontWeight: 'bold'}
}


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
      transition: '',
      solo:'',
      soloPressed:[]
    }
  }
//
// shouldComponentUpdate(nextProps, nextState){
//   const ctx = this;
//   const click = ctx.props.click;
//   if(click.isActive){
//     if (nextProps.click.current !== click.current){
//       return true;
//     }
//     else {
//       return false;
//     }
//   }
//     else
//       return true;
// }

  componentDidUpdate(prevProps, prevState) {
    const ctx = this;
    const globalparams = ctx.props.globalparams;
    const tidalServerLink = 'localhost:3001';
    const { patterns, click } = prevProps;
    const { solo } = ctx.state;
    const items = ctx.props.matrices;

    if (click.isActive && click.flag % click.times === 0) {
      var scenePatterns,
          channels,
          channel_type,
          channel_values,
          channel_name,
          channel_id,
          channel_transition,
          mat_name;

      _.each(items, function(d){
        if(d.matName === ctx.props.active){
          scenePatterns = d.patterns;
          channels = d.channels;
          mat_name = d.matName
        }
      })

      var channel_namestepvalues = [];
      _.each(channels, function(chan, i) {
        var runNo = Math.floor( click.current % chan.step) ;
        var stepvalue = '';
        channel_values = chan.vals;
        if (runNo !== undefined && (mat_name === chan.scene)) {
          _.each(channel_values, function(sv, j){
            if (j === runNo){
              stepvalue =  sv;
            }
          })
        if (stepvalue !== '')
          channel_namestepvalues = _.concat(channel_namestepvalues, {[chan.name]: stepvalue});
      }})
      if(channel_namestepvalues.length > 0){
        store.dispatch(sendPatterns(tidalServerLink, channel_namestepvalues,
           channels, scenePatterns, click, ctx.props.globalparams, solo ));
      }
    }
  }

  renderStep(item, _, i) {
    const ctx = this;
    const { click, active } = ctx.props;
    const step = parseInt(item.step);
    const currentStep = Math.floor( click.current % step);

      const setText=({ target: { value }}) => {
      item.vals[i] = value;
      const nc = { vals: item.vals, key: item.key };
      fbupdatechannelinscene('Matrices', nc, ctx.props.scene_key);
    }
    var className = 'playbox';
    if (currentStep === i)
      className += '-active';
    return <div key={(item['key']+'_'+i).toString()}>
      <textarea className={className} type="text"
                value={item.vals[i]}
                onChange={setText}/>
      </div>
  }
  renderItem(item) {
    const ctx = this;
    const {soloPressed} = ctx.state;
    if (item.scene !== ctx.props.active)
      return;

    const deleteChannel = event => {
      if (confirm('Are you sure you want to delete this channel?')) {
        fbdeletechannelinscene('Matrices', ctx.props.scene_key, item.key)
        var _cid = 0;
        _.each(Object.values(ctx.props.channel), function(ch,i){
          if(ch.scene=== ctx.props.active){
            ch.cid = _cid;
            _cid++;
            ctx.props.globalparams.storedPatterns[item.cid] = '';
            fbupdatechannelinscene('Matrices', ch, ctx.props.scene_key)

          }
        })
      }
    }
    const soloChannel = event => {
      const ctx = this;
      const {solo, soloPressed} = ctx.state;
      var pr = soloPressed;
      _.each(Object.values(ctx.props.channel), function(ch,i){
        if(ch.scene === ctx.props.active){
          if(ch.cid !== item.cid){
            pr[ch.cid]= false;
          }
        }
      })
      pr[item.cid]= true;
      ctx.setState({solo:item.name,soloPressed:pr});
    }
    const updateTransition = ({target : {value}}) => {
      const ctx = this;
      item.transition = value
      fbupdatechannelinscene('Matrices',
                { transition: value, key: item.key },
                ctx.props.scene_key)
    }

//soloPressed = {soloPressed[item.key]}
    const step = parseInt(item.step);
    const playerClass = "Channel"
    //TYPE : <p style={{opacity:0.5}}>{"  (" + item.type+ ")"}</p>
    return item && (
      <div key={(item['cid']).toString()} className={playerClass}>
        <div className = {"channelHeader " + item.type }>
          <button onClick={deleteChannel}>&nbsp;{'X'}</button>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
           <Button theme = {themeButton} onClick={soloChannel} activeStyle={{position:'relative', top: 2}} >S< /Button>

        </div>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
        <input className = "transition"
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
