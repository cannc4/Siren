
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';

import { fbdeletechannelinscene, fbupdatechannelinscene,
        sendPatterns} from '../actions';

var Button = require('react-button')
var themeButton = {
    style : {borderWidth: 0.8, borderColor: 'rgba(255,255,102,0.15)'} ,
    disabledStyle: { background: 'gray'},
    overStyle: { background: 'rgba(2,4,2,0.15)' },
    activeStyle: { background: 'rgba(44,44,44,0.15)' },
    pressedStyle: {background: 'rgba(200,200,200,0.75)'},
    overPressedStyle: {background: 'rgba(255,255,102,1)', fontWeight: 'bold'}
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
      soloPressed:[],
      soloActive:false
    }
  }

componentDidMount(){
  const  ctx = this;
  const soloPressed = ctx.state;
  var pr = [];
  for (var i =0 ;i <40; i++){
    pr[i]=false;
  }
  ctx.setState({soloPressed: pr });
}

sendPatterns(){
  const ctx = this;
  const globalparams = ctx.props.globalparams;
  const tidalServerLink = 'localhost:3001';
  const { patterns, click } = ctx.props;
  const { solo,soloActive } = ctx.state;
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
      if( soloActive=== true ){
        if (chan.name === solo){
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
           }
        }
      }
      else {
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
      }}
    })
    if(channel_namestepvalues.length > 0){

      store.dispatch(sendPatterns(tidalServerLink, channel_namestepvalues,
          channels, scenePatterns, click, ctx.props.globalparams, solo ));
    }
  }

}


  componentDidUpdate(prevProps, prevState) {
    const ctx = this;
    ctx.sendPatterns();
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
      const {solo, soloPressed, soloActive} = ctx.state;
      var pr = soloPressed;
     
      if(soloActive === false){
        for (var i = 0; i < pr.length; i++){
          pr[i] = false;
        }
        pr[item.cid] = !pr[item.cid];
      }
      else{
        for (var i = 0; i < pr.length; i++){
          pr[i] = false;
        }
      }
      var sel_solo;
      if(pr[item.cid] === false){
        sel_solo = 'x';
        }
      else {
        sel_solo = item.name;
      }
      ctx.setState({solo:sel_solo, soloPressed:pr, soloActive:pr[item.cid]});
      console.log("solo:" + solo);
      console.log("soloActive:" + soloActive);
      console.log("soloPressed:" + soloPressed);
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
          <Button theme = {themeButton} pressed = {soloPressed[item.cid]} onClick={soloChannel} activeStyle={{position:'relative', top: 2}} >S< /Button>


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
