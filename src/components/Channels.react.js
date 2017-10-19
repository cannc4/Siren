import { createSelectable } from 'react-selectable';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';
import Cell from './Cell.react'
const SelectableComponent = createSelectable(Cell);
import { fbdeletechannelinscene, fbupdatechannelinscene,
         sendPatterns, consoleSubmit, setExecution,sendScPattern } from '../actions';

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
      selectedCells: [],
			tolerance: 0,
			selectOnMouseMove: false,
      isSolo: props.solo.soloValue,
      isMute: props.mute.muteValue,
      loop: {isLoop: true, pauseTurn: 0, hasSilenced: false}
    }
  }

  focusChannel = () => {
    const ctx = this;
    const { item } = ctx.props;
    if(item.cid === 0){
      this.nameInput.focus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const ctx = this;
    const { click } = ctx.props;

    if (click.isActive &&
        click.flag % click.times === 0 &&
        !click.isExecuted)
    {
      ctx.sendPatterns();
    }
  }

  sendPatterns(){
    const ctx = this;
    const { click, solo, mute} = ctx.props;
    const { loop } = ctx.state;
    const channel = ctx.props.item;

    if (loop.isLoop || (!loop.isLoop && !loop.hasSilenced) )
    {
      if (!solo.isSolo || (solo.isSolo && solo.soloValue))
      {
        if (!mute.isMute || !mute.muteValue)
        {
          // Find the dictionary definitions of functions
          var scenePatterns;
          _.each(ctx.props.matrices, function(d){
            if(d.matName === ctx.props.active){
              scenePatterns = d.patterns;
            }
          })

          var runNo = _.floor(click.current % channel.step);
          if (!loop.isLoop && (_.toInteger(click.current / channel.step) > loop.pauseTurn)) {
            runNo = channel.step-1;
            store.dispatch(consoleSubmit('localhost:3001', channel.name + " $ silence"));
            ctx.setState({loop: {isLoop: loop.isLoop,
                                 pauseTurn: loop.pauseTurn,
                                 hasSilenced: true}});
            return;
          }

          var stepvalue = "";
          if (!_.isUndefined(runNo)) {
            stepvalue = channel.vals[runNo];
          }

          if (stepvalue !== ""){
            store.dispatch(setExecution());
            store.dispatch(sendPatterns('localhost:3001', channel, stepvalue,
              scenePatterns, click, ctx.props.globalparams));
          }
        }
        else{
          store.dispatch(consoleSubmit('localhost:3001', channel.name + " $ silence"));
        }
      }
    }
  }


  renderStep(item, __, i) {
    const ctx = this;
    const { click } = ctx.props;
    const { loop } = ctx.state;
    var   currentStep = _.floor(click.current % item.step);

    if (!loop.isLoop && (_.toInteger(click.current / item.step) > loop.pauseTurn))
      currentStep = item.step - 1;

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
    const { item, solo, mute } = ctx.props;
    const { loop } = ctx.state;

    console.log("Channel render ");

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
      ctx.props.soloOnClick(item.cid);
    }
    const muteChannel = event => {
      const ctx = this;
      ctx.props.muteOnClick(item.cid);
    }
    const updateTransition = ({target : {value}}) => {
      const ctx = this;
      item.transition = value;
      fbupdatechannelinscene('Matrices',
                             { transition: value, key: item.key },
                             ctx.props.scene_key)
    }
    const onClickFocus = ({ target: { value }}) => {
      this.nameInput.focus();
    }
    const loopChannel = event => {
      this.setState({loop: {isLoop: !this.state.loop.isLoop,
                            pauseTurn: _.toInteger(this.props.click.current / item.step),
                            hasSilenced: false}});
    }
    const step = parseInt(item.step, 10);
    var channelClass = "ChannelItem";
    if ((!loop.isLoop &&  loop.hasSilenced) ||
        ( solo.isSolo && !solo.soloValue) ||
        ( mute.isMute && mute.muteValue))
    {
      channelClass += " disabled";
    }
    return item.key && (
      <div key={item.key} className={channelClass}>
        <div key={item.key+'_h'} className={"ChannelItemHeader " + item.type }>
          <div className={"ChannelItemHeaderButtons"}>
            <button className={"Button "+ ctx.props.solo.soloValue} onClick={soloChannel}>S</button>
            <button className={"Button "+ ctx.props.mute.muteValue} onClick={muteChannel}>M</button>
          </div>
          <p>{item.name}</p>
          <input ref={(input) => { this.nameInput = input; }}
            key={item.key+'_t'} className={"GridItem-transition draggableCancel"}
            placeholder={" transition "}  value={item.transition}
            onChange={updateTransition}
            onClick={onClickFocus}/>
          <div className={"ChannelItemHeaderButtons"}>
          <button className={"Button"} onClick={deleteChannel}>X</button>
            <button className={"Button "+ ctx.state.loop.isLoop} onClick={loopChannel}>⭯</button>
          </div>
        </div>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
      </div>
    )
  }
}

// another React Performance
// import debugRender from 'react-render-debugger';
// export default connect(state => state)(debugRender(Channels));

export default connect(state => state)(Channels);
