import { SelectableGroup, createSelectable } from 'react-selectable';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';
import Cell from './Cell.react'
const SelectableComponent = createSelectable(Cell);
import { fbdeletechannelinscene, fbupdatechannelinscene,
        sendPatterns,selectCell} from '../actions';
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
      selectedCells: [],
      soloActive:false,
			tolerance: 20,
			selectOnMouseMove: false
    }
    //this.handleSelection = this.handleSelection.bind(this);
	
  }

  componentDidMount(){
    const ctx = this;
    const soloPressed = ctx.state;
    var pr = [];
    for (var i =0 ;i <40; i++){
      pr[i]=false;
    }
    ctx.setState({soloPressed: pr });
    //document.addEventListener('click', this.clearItems);
  }

	// clearItems (e) {
	// 	if(!isNodeInRoot(e.target, this.refs.selectable)) {
	// 		this.setState({
	// 			selectedItems: []
	// 		});
	// 	}
	// }
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


  handleSelection (selectedKeys) {
  const ctx = this;
  //const {selectedCells} = ctx.state;
  var b = [];
  console.log(selectedKeys);
  store.dispatch(selectCell(selectedKeys));
  
  }
  // Cell draw
  // renderStep(item, _, i) {
  //   const ctx = this;
  //   const { click, active } = ctx.props;
  //   const step = parseInt(item.step);
  //   const currentStep = Math.floor( click.current % step);
  //   return <Cell item = {item} index={i} c_cid = {item.cid} currentStep = {currentStep} s_key = { ctx.props.scene_key}/>
  // }

  renderStep(item, _, i) {
    const ctx = this;
    const { click, active } = ctx.props;
    const step = parseInt(item.step);
    const currentStep = Math.floor( click.current % step);
    
    return(
          <SelectableComponent item = {item} index={i} c_cid = {item.cid} 
          currentStep = {currentStep} s_key = { ctx.props.scene_key} >
          </SelectableComponent>
    )
    
  }

  // Render whole matrix
  render() {
    const ctx = this;
    const {soloPressed} = ctx.state;
    const item = ctx.props.item;

    if (item.scene !== ctx.props.active)
      return item && (
        <div key={(item['cid']).toString()} className={"Channel"}></div>
      );

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
    }
    const updateTransition = ({target : {value}}) => {
      const ctx = this;
      item.transition = value
      fbupdatechannelinscene('Matrices',
                { transition: value, key: item.key },
                ctx.props.scene_key)
    }

    const step = parseInt(item.step);
    const currentStep = Math.floor( ctx.props.click.current % step);
    const playerClass = "Channel"
    //const selected = this.state.selectedCells.indexOf(9) > -1;
    //selected={selected}
    var cssname = 'playbox';
    
    return item && (
      <div key={(item['cid']).toString()} className={playerClass}>
        <div className = {"channelHeader " + item.type }>
          <button onClick={deleteChannel}>&nbsp;{'X'}</button>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
          <Button theme = {themeButton} pressed = {soloPressed[item.cid]} onClick={soloChannel} activeStyle={{position:'relative', top: 2}}>S</Button>
        </div>
        <SelectableGroup onSelection={ctx.handleSelection.bind(ctx)}
          tolerance={this.state.tolerance}
					selectOnMouseMove={this.state.selectOnMouseMove}
          preventDefault = {false}
          selectableKey={(item.cid +'_').toString()}>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
        </SelectableGroup>
        <input className = "transition"
          placeholder={" - "}  value = {item.transition}
          onChange = {updateTransition}/>
      </div>
    )
  }
}

export default connect(state => state)(Channels);
