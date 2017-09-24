import { createSelectable } from 'react-selectable';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';
import Cell from './Cell.react'
const SelectableComponent = createSelectable(Cell);
import { fbdeletechannelinscene, fbupdatechannelinscene, sendPatterns } from '../actions';

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
      loop: {isLoop: true, pauseTurn: 0, hasSilenced: false}
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   const ctx = this;
  //   console.log(nextProps.click.current, ctx.props.click.current);
  //   if (nextProps.click.current !== ctx.props.click.current)
  //     return false;
  //   return true;
  // }

  componentDidUpdate(prevProps, prevState) {
    const ctx = this;
    ctx.sendPatterns();
  }

  sendPatterns(){
    const ctx = this;

    const tidalServerLink = 'localhost:3001';
    const { click, solo } = ctx.props;
    const { loop } = ctx.state;
    const allScenes = ctx.props.matrices;
    const chan = ctx.props.item;

    if (click.isActive && click.flag % click.times === 0) {
      // Find the dictionary definitions of functions
      var scenePatterns;
      _.each(allScenes, function(d){
        if(d.matName === ctx.props.active){
          scenePatterns = d.patterns;
        }
      })

      var runNo, stepvalue = '';
      // console.log('sendPatterns for '+chan.name,  solo);
      if (!solo.isSolo || (solo.isSolo && solo.soloValue)) {
        runNo = Math.floor( click.current % chan.step);
        if (runNo !== undefined) {
          stepvalue = chan.vals[runNo];
        }
        // console.log(chan, stepvalue, runNo);
        if (stepvalue !== ""){
          store.dispatch(sendPatterns(tidalServerLink, chan, stepvalue,
              scenePatterns, click, ctx.props.globalparams ));
        }
      }
    }
  }


  renderStep(item, _, i) {
    const ctx = this;
    const { click } = ctx.props;
    const step = parseInt(item.step, 10);
    const current = parseInt(click.current, 10);
    var   currentStep = Math.floor( current % step);

    if (!ctx.state.loop.isLoop && (parseInt(current / step, 10) > ctx.state.loop.pauseTurn))
      currentStep = step-1;

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
    const { item } = ctx.props;

    console.log('RENDERING CHANNEL '+item.name);

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
    const loopChannel = event => {
      this.setState({loop: {isLoop: !this.state.loop.isLoop,
                            pauseTurn: this.props.click.current / item.step,
                            hasSilenced: false}});
    }
    const step = parseInt(item.step, 10);
    return item.key && (
      <div key={item.key} className={"ChannelItem"}>
        <div key={item.key+'_h'} className={"ChannelItemHeader " + item.type }>
          <div className={"ChannelItemHeader"}>
            <button className={"Button "+ this.state.loop.isLoop} onClick={loopChannel}>⭯</button>
            <button className={"Button "+ ctx.props.solo.soloValue} onClick={soloChannel}>S</button>
          </div>
          <p>{item.name}</p>
          <button className={"Button"} onClick={deleteChannel}>X</button>
        </div>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
        <input ref={(input) => { this.nameInput = input; }}
          key={item.key+'_t'} className={"GridItem-transition draggableCancel"}
          placeholder={" - "}  value={item.transition}
          onChange={updateTransition}
          onClick={tests}/>
      </div>
    )
  }
}

export default connect(state => state)(Channels);
