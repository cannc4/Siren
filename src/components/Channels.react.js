import { createSelectable } from 'react-selectable';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';
import Cell from './Cell.react'
const SelectableComponent = createSelectable(Cell);
import { fbdeletechannelinscene, fbupdatechannelinscene,
        sendPatterns } from '../actions';

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
			tolerance: 0,
			selectOnMouseMove: false
    }
    //this.handleSelection = this.handleSelection.bind(this);

  }

  componentDidMount(){
    const ctx = this;

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

    const tidalServerLink = 'localhost:3001';
    const { click } = ctx.props;
    const { solo, soloActive } = ctx.state;
    const items = ctx.props.matrices;

    if (click.isActive && click.flag % click.times === 0) {
      var scenePatterns,
        channels,
        // channel_type,
        channel_values,
        // channel_name,
        // channel_id,
        // channel_transition,
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
        var runNo, stepvalue;
        if ( !(soloActive === true && chan.name !== solo) )
        {
          runNo = Math.floor( click.current % chan.step) ;
          stepvalue = '';
          channel_values = chan.vals;
          if (runNo !== undefined && (mat_name === chan.scene) && chan.name === ctx.props.item.name) {
            _.each(channel_values, function(sv, j){
              if (j === runNo){
                stepvalue =  sv;
              }
            })
            if (stepvalue !== '')
              channel_namestepvalues = _.concat(channel_namestepvalues, {[chan.name]: stepvalue});
          }
        }
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
    const { click } = ctx.props;
    const step = parseInt(item.step, 10);
    const currentStep = Math.floor( click.current % step);

    return(
      <SelectableComponent
        selectableKey={item.cid+'_'+i}
        key={item.key+'_'+i}
        item={item}
        index={i}
        c_cid={item.cid}
        currentStep={currentStep}
        s_key={ctx.props.scene_key} >
      </SelectableComponent>
    )
  }

  // Render whole matrix
  render() {
    const ctx = this;
    const {soloPressed} = ctx.state;
    const item = ctx.props.item;

    if (item.scene !== ctx.props.active)
      return item.key && (
        <div key={item.key}></div>
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
      const { soloPressed, soloActive} = ctx.state;
      var pr = soloPressed;

      if(soloActive === false){
        for (var i = 0; i < pr.length; i++){
          pr[i] = false;
        }
        pr[item.cid] = !pr[item.cid];
      }
      else{
        for (var j = 0; j < pr.length; j++){
          pr[j] = false;
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
      item.transition = value;
      fbupdatechannelinscene('Matrices',
                { transition: value, key: item.key },
                ctx.props.scene_key)
    }
    const tests = ({ target: { value }}) => {
      this.nameInput.focus();
    }
    const step = parseInt(item.step, 10);
    return item.key && (
      <div key={item.key} className={"ChannelItem"}>
        <div key={item.key+'_h'} className={"ChannelItemHeader " + item.type }>
          <button className={"Button "+ soloPressed[item.cid]} onClick={soloChannel}>S</button>
          <p>{item.name}</p>
          <button className={"Button"} onClick={deleteChannel}>X</button>
        </div>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
        <input ref={(input) => { this.nameInput = input; }}
          key={item.key+'_t'}className={"GridItem-transition draggableCancel"}
          placeholder={" - "}  value={item.transition}
          onChange={updateTransition}
          onClick={tests}/>
      </div>
    )
  }
}

export default connect(state => state)(Channels);
