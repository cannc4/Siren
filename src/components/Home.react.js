import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

import { initMyTidal,sendScCommand, sendSCMatrix, sendCommands,createTimer,timerThread,
      startTimer, pauseTimer, stopTimer,updateTimerduration,startIndividualTimer,stopIndividualTimer,pauseIndividualTimer,
      consoleSubmit, fbcreateMatrix, fbdelete,fborder, fetchModel, updateMatrix,
      startClick,stopClick} from '../actions'
import {Layout, LayoutSplitter} from 'react-flex-layout';
import Commands from './Commands.react';
import Firebase from 'firebase';
import store from '../store';
import _ from 'lodash';

class Home extends Component {
constructor(props) {
super(props);
this.state={
  matName: "",
  modelName : "Matrices",
  tidalServerLink: 'localhost:3001',
  steps: 12,
  channels: ['t1','t2','t3', 't4', 't5'],
  timer: [],
  values: {},
  scCommand: '',
  click : {current:null,
          isActive:false},
  activeMatrix: '',
  songmodeActive: false,
  sceneIndex: '',
  transition: [],
  channelEnd :[],
  play : false,
  solo : [],
  soloSentinel: false,
  sceneSentinel: false
}
}

//Clock for Haskell
// componentDidMount(props,state){
//   const ctx = this;
//    // const ctx = this;
  //
  // var socket = io('http://localhost:3003/'); // TIP: io() with no args does auto-discovery
  // socket.on("osc", data => {
  //   this.startClick();
  // })
  // socket.on("dc", data => {
  //   this.stopClick();
  // })
//   var socket = io('http://localhost:3001/'); // TIP: io() with no args does auto-discovery
//   socket.on("/command", data => {
//     console.log(data);
//     //this.startClick();
//   })
// }
// shouldComponentUpdate(nextProps, nextState) {
//   const {timer} = nextProps;
//   const {channels} = nextState;
//   for (var i = 0; i < channels.length; i++) {
//     if (nextProps.timer.timer[i].isActive) {
//       return true;
//     }
//   }
//   return false;
// }
componentWillMount(props,state){
console.log(this.props.location.pathname);
  const ctx=this;
  var tempEnd = [];
  const { channelEnd, channels , steps , timer, solo}=ctx.state;
  for (var i = 0; i < channels.length; i++) {
     if (timer[i] === undefined) timer[i]={ id: i, duration: 48,  isActive: false,  current: 0};
     ctx.createTimer(i, 48, steps);
     //store.dispatch(timerThread(i, ctx.props.timer.timer[i].duration, steps));
     tempEnd[i] = false
     solo[i] = false;
   }
   ctx.setState({channelEnd : tempEnd});

}
createTimer(i,duration, steps){
  store.dispatch(createTimer(i,duration,steps));
}

componentDidUpdate(props, state) {
  var runNo = [];
  const ctx=this;
  const { commands, timer, click}=props;
  const {channelEnd, steps, tidalServerLink, values, channels, activeMatrix, songmodeActive, sceneEnd, solo, transition }=state;
  for (var i = 0; i < channels.length; i++) {

    if (ctx.props.timer.timer[i].isActive) {
    runNo[i] = (ctx.props.timer.timer[i].current % steps) + 1;

    if(ctx.props.timer.timer[i].current % steps === steps-1){
      if(songmodeActive){
        channelEnd[i] = true;
        ctx.setState({channelEnd : channelEnd});
        store.dispatch(pauseIndividualTimer(i))
        if(ctx.identical(channelEnd ) === true){
            ctx.progressMatrices( ctx.props[ctx.state.modelName.toLowerCase()]);
        // ctx.startTimer();
        }
      }
    }

  if(values[runNo[i]]!== undefined){
    const vals = values[runNo[i]][channels[i]];
    const channel = channels[i];
    const obj = {[channel]: vals};
      if (vals !== undefined) {
        var sceneCommands = [];
        const items = this.props[this.state.modelName.toLowerCase()]
        _.each(items, function(d){
          if(d.matName === activeMatrix)
            sceneCommands = d.commands;
        })

        ctx.sendCommands(tidalServerLink, obj , sceneCommands,solo, transition, channels);
        }
      }
    }
  }
}



identical(array) {
    for(var i = 0; i < array.length ; i++) {
        if(array[i] === false ) {
            return false;
        }
    }
    return true;
}


progressMatrices(items){
  const ctx = this;
  const { timer } = ctx.props;
  const { channelEnd, values, activeMatrix, steps, songmodeActive} = ctx.state;
  var commands = [];

//for (var i = 0; i < channelEnd.length; i++) {


  //timer[i].isActive = false;
  if(ctx.identical(channelEnd))
  {
    var i_save = -1;
    for (var j = 0; j < channelEnd.length; j++) {
      channelEnd[j] = false;

    }
    _.each(items, function(d, i, j){
      if(d.matName === activeMatrix)
      {
        i_save = _.indexOf(Object.values(items), d);
        commands = d.commands;
      }
    })

    const nextObj = Object.values(items)[(i_save+1)%Object.values(items).length];
    updateMatrix(commands, values, nextObj);
    for (var i = 0; i < channelEnd.length; i++) {
      channelEnd[i] = false;
    }
    ctx.setState({ activeMatrix : nextObj.matName, channelEnd : channelEnd });

  }
  //}
}

enableSongmode(){
  this.setState({ songmodeActive : true});
}
disableSongmode(){
  this.setState({ songmodeActive : false});
}


runTidal() {
  const ctx=this;
  const { tidalServerLink } = ctx.state;
  store.dispatch(initMyTidal(tidalServerLink));
}

sendCommands(tidalServerLink, vals, channelcommands, commands,solo,transition, channels) {
  store.dispatch(sendCommands(tidalServerLink, vals, channelcommands, commands,solo, transition, channels));
}
sendSCMatrix(tidalServerLink, vals, commands) {
  store.dispatch(sendSCMatrix(tidalServerLink, vals, commands));
}

sendScCommand(tidalServerLink, command) {
  store.dispatch(sendScCommand(tidalServerLink, command));
}

consoleSubmit(tidalServerLink, value){
  store.dispatch(consoleSubmit(tidalServerLink, value));
}

handleSubmit = event => {
  const body=event.target.value
  const ctx=this;
  const {scCommand, tidalServerLink }=ctx.state;

  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.sendScCommand(tidalServerLink, scCommand);
  }
}

handleConsoleSubmit = event => {
  const value = event.target.value;
  const ctx = this;
  const {tidalServerLink} = ctx.state;

  if(event.keyCode === 13 && event.ctrlKey && value){
    ctx.consoleSubmit(tidalServerLink, value);
  }
}

updateMatrix(commands, values, item) {

  const items = this.props[this.state.modelName.toLowerCase()]
  console.log('SCENES: ');
  _.forEach(Object.values(items), function(d){
    console.log(d.matName + ' ' + d.sceneIndex);
  });

  store.dispatch(updateMatrix(commands, values, item));
}

// updateChannelduration(c, channeldur){
//   const ctx = this;
//   const {steps, duration, channels} = ctx.state;
//   duration[c] = channeldur;
//   var c = channels.indexOf(c)
//   console.log(c);
//   ctx.setState({duration:duration});
//   store.dispatch(updateTimerduration(c,channeldur, steps));
// }
updateDur = ({target : {value, id}}) => {

    const ctx = this;
    const {channels,steps} = ctx.state;
    const {timer} = ctx.props;
    var _index = _.indexOf(channels,id);
    if(value !== undefined && value !== "")
      store.dispatch(updateTimerduration(_index,value,steps));
}

soloChannel =  ({target : {id}}) => {
  const ctx = this;
  const {channels,solo,soloSentinel} = ctx.state;
  var _index = _.indexOf(channels,id);
  if(_index !== -1 ){

    for (var i = 0; i < solo.length; i++) {
      if(_index !== i)
        solo[i] = false;
    }
    solo[_index] = !solo[_index];
    console.log(solo);
    ctx.setState({solo: solo, soloSentinel : solo[_index]});

  }
  //add solo channels
  //const _key = event.target.id;
}

renderPlayer() {
  const ctx=this;
  const { channels, steps , timer, solo, soloSentinel,transition}=ctx.state;
  const playerClass="Player Player--" + (channels.length + 1.0) + "cols";
  var count = 1;

  return (<div className="Player-holder">
    <div className={playerClass}>
      <div className="playbox playbox-cycle">cycle</div>
      {_.map(channels, c => {
        return <div className="playbox playbox-cycle" key={c}>{c}<input className = "durInput" id = {c} value={ctx.props.timer.timer[_.indexOf(channels, c)].duration}
        onChange = {ctx.updateDur.bind(ctx)}onKeyUp={ctx._handleKeyPress.bind(ctx)}/>
        {!solo[_.indexOf(channels, c)] && <img src={require('../assets/stop@3x.png')}  id = {c}  onClick={ctx.soloChannel.bind(ctx)} height={20} width={20}/>}
        {solo[_.indexOf(channels, c)] && <img src={require('../assets/stop_fill@3x.png')}  id = {c}  onClick={ctx.soloChannel.bind(ctx)} height={20} width={20}/>}

         </div>
      })}
    </div>
    {_.map(Array.apply(null, Array(steps)), ctx.renderStep.bind(ctx))}
      <div className={playerClass}>
        <div className="playbox playbox-cycle">Transition</div>
      {_.map(channels, c => {
        return <input className = "playbox" id = {c} key = {c} value = {ctx.state.transition[_.indexOf(channels, c)]} style = {{margin: 5}}
        onChange = {ctx.updateT.bind(ctx)}onKeyUp={ctx._handleKeyPressT.bind(ctx)}/>
      })}
      </div>
  </div>)
}

updateDur = ({target : {value, id}}) => {

    const ctx = this;
    const {channels,steps} = ctx.state;
    const {timer} = ctx.props;
    var _index = _.indexOf(channels,id);
    if(value !== undefined && value !== "")
      store.dispatch(updateTimerduration(_index,value,steps));
}

_handleKeyPress = event => {

  const ctx=this;
  const {steps, channels, timer} = ctx.state;
  const _key = event.target.id;
  var value = event.target.value;
  var _index = _.indexOf(channels, _key);

  if(event.keyCode === 13 && event.ctrlKey){
    // if( value < "4"){
    //   value = 4;
    // }
    if(ctx.props.timer.timer[_index].isActive === true){
      store.dispatch(pauseIndividualTimer(_index));
    }
    startIndividualTimer(_index, value,steps);
  }
  else if (event.keyCode === 13 && event.shiftKey){
    // if( value < "10"){
    //   value = 10;
    // }
    if(ctx.props.timer.timer[_index].isActive === true){
      store.dispatch(stopIndividualTimer(_index));
    }
  }
}



updateT = ({target : {value, id}}) => {

  const ctx=this;
  const {transition, channels} = ctx.state;
  const _key =id;
  var value = value;
  var _index = _.indexOf(channels, _key);
  var temp = transition;
  console.log("TRANSITION");
  console.log(temp);
  temp[_index] = value;
  console.log(transition[_index]);
  ctx.setState({transition:temp});
}


_handleKeyPressT = event => {

  const ctx=this;
  const {transition, channels} = ctx.state;
  const _key = event.target.id;
  var value = event.target.value;
  var _index = _.indexOf(channels, _key);

  if(event.keyCode === 13 && event.ctrlKey){
    var temp = transition;
    temp[_index] = value;
   console.log(transition[_index]);
   ctx.setState({transition:temp});
  }
}
startTimer() {

  const ctx = this;
  const {channels, steps, play} = ctx.state;

  for (var i = 0; i < channels.length; i++) {
    startIndividualTimer(i, ctx.props.timer.timer[i].duration,steps);
  }
  ctx.setState({play:true});
}

pauseTimer() {

    const ctx = this;
    const {channels, play} = ctx.state;
    for (var i = 0; i < channels.length; i++) {
      store.dispatch(pauseIndividualTimer(i));
    }
    ctx.setState({play: false});
}

stopTimer() {

  const ctx = this;
  const {channels, play} = ctx.state;
  for (var i = 0; i < channels.length; i++) {
    store.dispatch(stopIndividualTimer(i));
  }
  ctx.setState({play: false});
}

renderStep(x, i) {
  const ctx=this;
  const { channels, steps }=ctx.state;
  const { timer, click, commands }=ctx.props;

  //var currentStep = [];
  // for (var i = 0; i < timer.length; i++) {
  //   currentStep[i] = timer[i].current %steps;
  // }
  //
  //     for (var j = 0; j < timer.length; j++) {
  //       if(i === currentStep[j]){
  //        indvChannel[j] += "playbox-active";
  //       }
  //     }
  var playerClass="Player Player--" + (channels.length + 1.0) + "cols";

  var colCount=0;

  return <div key={i} className={playerClass}>
    <div className="playbox playbox-cycle">{i+1}</div>
    {_.map(channels, c => {
      const setText=({ target: { value }}) => {
          const {values}=ctx.state;
          if (values[i+1] === undefined) values[i+1]={}
          values[i+1][c] = value;
          ctx.setState({values});
      }

      const getValue=() => {
        const values=ctx.state.values;
        if (values[i+1] === undefined || values[i+1][c] === undefined) return ''
        return values[i+1][c];
      }

      const textval=getValue();

      const index=channels.length*i+colCount++;

      const mapNumbers =(value, istart, istop, ostart, ostop) => {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
      }

      //Timer Check
      var _index = _.indexOf(channels,c);
      const currentStep = ctx.props.timer.timer[_index].current % steps;
      var individualClass = "playbox";
      if (i === currentStep) {
        individualClass += " playbox-active";
      }


      // dynamic cell height
      const cellHeight = 85/steps;
      // dynamic text size
      const textSize = textval.length > 10 ? Math.max( 0.65, mapNumbers(textval.length, 10, 30, 1, 0.65)) : 1;
      return <div className={individualClass} style={{height: cellHeight+'vh'}} key={c+'_'+i}>
        <textarea type="text" style={{fontSize: textSize+'vw'}}value={textval} onChange={setText}/>
      </div>
    })}
  </div>;
}

changeName({target: { value }}) {
  const ctx = this;
  ctx.setState({ matName: value , sceneSentinel: false});
}

addItem() {
  const ctx = this;
  var commands = [];
  const { matName, activeMatrix, values, sceneIndex } = ctx.state;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  _.each(items, function(d){
    if(d.matName === activeMatrix){
      commands = d.commands;
    }
  })

  if ( matName.length >= 2 && _.isEmpty(values) === false) {
    var snd = Object.values(items).length;

    fbcreateMatrix(ctx.state.modelName, { matName, commands, values, sceneIndex: snd });
    ctx.setState({sceneIndex: snd});
  }
  ctx.setState({activeMatrix: matName});
}

reorder (index,flag){

  const ctx = this;
  const { commands }=ctx.props;
  // const { commands }=ctx.state;
  const { matName, values, sceneIndex } = ctx.state;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];

  const keys = Object.keys(items);
  const vals = Object.values(items);
  const len = keys.length;

  if(flag === "up" && index === 0)
    return;
  else if(flag === "down" && len-1 === index)
    return;
  else{
    if(flag === "up"){
      if (vals[index].sceneIndex === index){
        var upIndex = index - 1;
        var upMatName = vals[upIndex].matName;
        var upValues = vals[upIndex].values;
        var upCommands = vals[upIndex].commands;
        var downMatName = vals[index].matName;
        var downValues = vals[index].values;
        var downCommands = vals[index].commands;

        fborder(ctx.state.modelName, {matName: upMatName,   commands: upCommands, values: upValues, sceneIndex: index},    keys[upIndex]);
        fborder(ctx.state.modelName, {matName: downMatName, commands: downCommands, values: downValues, sceneIndex: upIndex},  keys[index]);
      }
    }
    else if (flag === "down") {
      if (vals[index].sceneIndex === index){
        var downIndex = index + 1;
        var downMatName = vals[downIndex].matName;
        var downCommands = vals[downIndex].commands;
        var downValues = vals[downIndex].values;
        var upMatName = vals[index].matName;
        var upCommands = vals[index].commands;
        var upValues =  vals[index].values;

        fborder(ctx.state.modelName, {matName: downMatName, commands: downCommands, values: downValues, sceneIndex: index}, keys[downIndex]);
        fborder(ctx.state.modelName, {matName: upMatName,   commands: upCommands, values: upValues, sceneIndex: downIndex}, keys[index]);
      }
    }
  }
}


renderItem(item, dbKey, i) {
  const ctx = this;
  const { values, activeMatrix} = ctx.state;
  const { commands } = ctx.props;
  const model = fetchModel(ctx.state.modelName);

  const updateMatrix = () => {
    ctx.setState({ activeMatrix: item.matName, matName: item.matName, sceneSentinel: true });
    ctx.updateMatrix(commands, values, item);
  }

  const handleDelete = ({ target: { value }}) => {
    const payload = { key: dbKey };
    fbdelete(ctx.state.modelName, payload);

    // re-order all items after delete successfull
    Firebase.database().ref("/matrices").once('child_removed').then(function(oldChildSnapshot) {
      const items = ctx.props[ctx.state.modelName.toLowerCase()];
      ctx.setState({sceneIndex: (Object.values(items).length)});
      _.forEach(Object.values(items), function(d, i){
        fborder(ctx.state.modelName, {matName: d.matName, commands: d.commands, values: d.values, sceneIndex: i}, d.key);
      });
    }, function(error) {
      console.error(error);
    });
  }

  return item.key && (
      <div key={item.key} className="matrices" >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '1px'}}>
          <button onClick={handleDelete}>{'x'}</button>
          {activeMatrix === item.matName && <button className={'buttonSentinel'} onClick={updateMatrix} style={{ color: 'rgba(255,255,102,0.75)'}}>{item.matName}</button>}
          {activeMatrix !== item.matName && <button className={'buttonSentinel'} onClick={updateMatrix} style={{ color: '#ddd'}}>{item.matName}</button>}
          <button onClick={ctx.reorder.bind(ctx,item.sceneIndex, 'up')}>{'↑'} </button>
          <button onClick={ctx.reorder.bind(ctx,item.sceneIndex, 'down')}>{'↓'}</button>
        </div>
      </div>
    )
}

renderItems(items) {
  const ctx = this;
  return _.map(items, ctx.renderItem.bind(ctx));
}

renderMetro(){
  const ctx=this;
  const { click }=ctx.props;
  const currentStep=click.current;
  var metro="metro metro--" ;
  if (currentStep % 2 == 0 ) {
    metro += " metro-active";
  }
  else {
    metro = "metro metro--"
  }
  return <div className={metro}>{}
    <input type="text" placeholder= "Metro"/>
  </div>
}

clearMatrix(){
  const ctx = this;


  const { values, channels, steps} = ctx.state;
  console.log(values);
  for (var i = 0; i < channels.length*steps; i++) {

      values [i] = [];

  }
  ctx.setState({values});
}

renderMenu(){
  const ctx=this;
  const { tidal, timer, click }=ctx.props;
  const { scCommand, tidalServerLink, play}=ctx.state;
  const { commands }=ctx.props;
  // const { commands }=ctx.state;
  const { values, steps, channels}=ctx.state;



  const updateTidalServerLink=({ target: { value } }) => {
      ctx.setState({ tidalServerLink: value });
  }

  const updateScCommand=({ target: { value } }) => {
    ctx.setState({scCommand: value})
  }


    // REPLACING START PAUSE STOP WITH IMAGES
//<pre style={{marginTop: '0px'}}>{JSON.stringify(timer, null, 2)}</pre>


  return   <div className="Tidal" style={{margin: '5px'}}>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
      Tidal Server Link
      <input type="text" value={tidalServerLink} onChange={updateTidalServerLink}/>
      {!tidal.isActive && <button className={'buttonSentinel'} onClick={ctx.runTidal.bind(ctx)}>Start SC</button>}
      {tidal.isActive && <button className={'buttonSentinel'}>Running</button>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
    {!play && <img src={require('../assets/play@3x.png')} onClick={ctx.startTimer.bind(ctx)} height={32} width={32}/>}
    {play && <div> <img src={require('../assets/pause@3x.png')} onClick={ctx.pauseTimer.bind(ctx)} height={32} width={32}/>
                             <img src={require('../assets/stop@3x.png')} onClick={ctx.stopTimer.bind(ctx)} height={32} width={32}/> </div>}


    </div>
    <div id="Command">

        <p>  </p>
        <p>Console</p>
       <textarea className="defaultCommandArea" value={scCommand} onChange={updateScCommand} placeholder={'SuperCollider (Ctrl + Enter) '} onKeyUp={ctx.handleSubmit.bind(ctx)} rows="20" cols="30"/>
      </div>
  </div>
}



render() {
  const ctx=this;
  const { tidal, timer, click }=ctx.props;
  const { commands }=ctx.props;
  // const { commands }=ctx.state;
  const { scCommand, tidalServerLink, values, steps, channels, songmodeActive, activeMatrix }=ctx.state;


  const viewPortWidth = '100%'

  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  var options = {
      mode: 'elm',
      theme: 'base16-light',
      fixedGutter: true,
      scroll: true,
      styleSelectedText:true,
      showToken:true,
      lineWrapping: true,
      showCursorWhenSelecting: true
  };

  return <div className={"Home cont"}>
    <Layout fill='window'>
      <Layout layoutWidth={120}>
        <div id="matrices" style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin: '2px'}}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px'}}>
            <input className={'newCommandInput'} placeholder={'New Scene Name'} value={ctx.state.matName} onChange={ctx.changeName.bind(ctx)}/>
            {this.state.sceneSentinel && <button onClick={ctx.addItem.bind(ctx)}>Update</button>}
            {!this.state.sceneSentinel && <button onClick={ctx.addItem.bind(ctx)}>Add</button>}
            <button onClick={ctx.clearMatrix.bind(ctx)}> Clear Matrix </button>
          </div>

          <div>
            {!songmodeActive && <button className={'buttonSentinel'} onClick={ctx.enableSongmode.bind(ctx)}>Start Songmode</button>}
            {songmodeActive && <button className={'buttonSentinel'} onClick={ctx.disableSongmode.bind(ctx)}>Stop Songmode</button>}
          </div>
          <div className={'sceneList'} style={{ width: '100%'}}>
            <ul style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '0', margin: '0'}}>
              {ctx.renderItems(items)}
            </ul>
          </div>
        </div>
      </Layout>
      <LayoutSplitter />
      <Layout layoutWidth='flex'>
        {ctx.renderPlayer()}
      </Layout>
      <LayoutSplitter />
      <Layout layoutWidth={250}>
        <div className="Commands" >
          <div className="CommandsColumn" >
            <Commands active={activeMatrix}/>
          </div>

        </div>
      </Layout>
      <LayoutSplitter />
      <Layout layoutWidth={200}>
        <div style={{display:'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          {ctx.renderMenu()}
          <div id="Execution" style={{alignSelf:'center'}}>
            <textarea className="defaultCommandArea"  onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder="Tidal (Ctrl + Enter)" width={'100%'}/>
          </div>
        </div>
      </Layout>
    </Layout>
  </div>
  }
}
export default connect(state => state)(Home);
