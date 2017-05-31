import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

// const version = JSON.parse(require('fs').readFileSync('../../package.json', 'utf8')).version

import { initMyTidal,sendScPattern, sendSCMatrix, sendPatterns,createTimer,timerThread,
      startTimer, pauseTimer, stopTimer,updateTimerduration,startIndividualTimer,stopIndividualTimer,pauseIndividualTimer,
      consoleSubmit, fbcreateMatrix, fbdelete,fborder, fetchModel, updateMatrix,assignTimer,globalUpdate,
      startClick,stopClick,globalStore, changeUsername,continousPattern, fbfetchscenes, GitHubLogin, logout} from '../actions'

import {Layout, LayoutSplitter} from 'react-flex-layout';

import NumberEditor from 'react-number-editor';
import Simple from './Simple.react';
import Patterns from './Patterns.react';
import Firebase from 'firebase';
import store from '../store';
import _ from 'lodash';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/dialog/dialog.css';
import '../assets/_style.css';
import '../assets/_rule.js';
var Button = require('react-button')
var options = {
    mode: '_rule',
    theme: '_style',
    fixedGutter: false,
    scroll: true,
    styleSelectedText:true,
    showToken:true,
    lineWrapping: true,
    showCursorWhenSelecting: true
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state={
      matName: "",
      modelName : "Matrices",
      tidalServerLink: 'localhost:3001',
      steps: 8,
      channels: ['1','2','3', '4', '5', 'G'],
      timer: [],
      values: {},
      scPattern: '',
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
      sceneSentinel: false,
      parvalues: '',
      globalCommands: '',
      globalTransformations: '',
      username: '',
      storedPatterns: [],
      storedGlobals: [{transform:'', command: ''}],
      tempDur : [],
      tidalOnClickClass:  ' ',
      pressed : false,
    }
  }
//Clock for Haskell
// componentDidMount(props,state){
//   const ctx = this;
//   CodeMirror.fromTextArea(document.getElementByClass('defaultPatternArea'), {options: options}).on("keyup", function (cm, event) {
//     console.log('deneme');
//     if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
//         event.keyCode != 13) {        /*Enter - do not open autocomplete list just after item has been selected in it*/
//         CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
//     }
//   });
// }
  //
  // var socket = io('http://localhost:3003/'); // TIP: io() with no args does auto-discovery
  // socket.on("osc", data => {
  //   this.startClick();
  // })
  // socket.on("dc", data => {
  //   this.stopClick();
  // })
//   var socket = io('http://localhost:3001/'); // TIP: io() with no args does auto-discovery
//   socket.on("/pattern", data => {
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

// componentDidMount(){
//   cm.ref.on('keyUp', function(instance, event) {
//     console.log(instance, event);
// });
// }

componentWillReceiveProps(nextProps) {
  const ctx = this;
  if(nextProps.user !== undefined &&
     nextProps.user.user !== undefined &&
     nextProps.user.user.name !== undefined &&
     ctx.state.username === '')
  {
    ctx.setState({username: nextProps.user.user.name});
    var obj = Firebase.database().ref("/matrices").push({itemToRemove2: nextProps.user.user.name});
    Firebase.database().ref("/matrices").child(obj.key).remove();
  }
}

componentWillMount(props,state){
  document.addEventListener("keydown", this.handleglobalKeys.bind(this));
  const ctx=this;
  var tempEnd = [];
  const { channelEnd, channels , steps , timer, solo, storedGlobals}=ctx.state;
  for (var i = 0; i < channels.length; i++) {
   if (timer[i] === undefined) timer[i]={ id: i, duration: 48,  isActive: false,  current: 0};
   ctx.createTimer(i, 48, steps);

   tempEnd[i] = false
   solo[i] = false;

   storedGlobals[0] = {transform: '', command: ''}
   ctx.setState({storedGlobals : storedGlobals})

 }
 ctx.setState({channelEnd : tempEnd});
}

createTimer(i,duration, steps){
  store.dispatch(createTimer(i,duration,steps));
}

componentDidUpdate(props, state) {
  var runNo = [];
  const ctx=this;
  const { patterns, timer, click}=props;
  const {channelEnd, steps, tidalServerLink, values, channels, activeMatrix, songmodeActive, sceneEnd, solo, transition, storedPatterns,storedGlobals }=state;

  for (var i = 0; i < channels.length; i++) {
    if (ctx.props.timer.timer[i].isActive) {
      runNo[i] = (ctx.props.timer.timer[i].current % steps) + 1;
      if(values[runNo[i]]!== undefined){
        const vals = values[runNo[i]][i];
        const channel = channels[i];
        if (vals !== undefined) {
          if(channel === 'G'){
            var newGlobals = Object.values(storedGlobals[parseInt(vals)]);
            console.log(newGlobals);
            if(newGlobals!== undefined){
              ctx.updatePatterns(tidalServerLink,storedPatterns,newGlobals[0], newGlobals[1],channels, transition);
              }
          }
          else {
            const obj = {[channel]: vals};
            var scenePatterns = [];
            const items = this.props[this.state.modelName.toLowerCase()]
            _.each(items, function(d){
              if(d.matName === activeMatrix)
              scenePatterns = d.patterns;
            })

            // if (i%4 == 0)
            //   ctx.updateGlobalsTest();

            ctx.sendPatterns(tidalServerLink, obj , scenePatterns,solo, transition, channels,timer.timer[i]);
          }
        }
      }

      if(ctx.props.timer.timer[i].current % steps === steps-1){
        if(songmodeActive){
          channelEnd[i] = true;
          ctx.setState({channelEnd : channelEnd});
          store.dispatch(pauseIndividualTimer(i))

          if(ctx.identical(channelEnd ) === true)
          {
            ctx.progressMatrices( ctx.props[ctx.state.modelName.toLowerCase()]);
            ctx.stopTimer();
            ctx.startTimer();
          }
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
  const { channelEnd, values, activeMatrix, steps, songmodeActive, transition, tempDur, channels,storedGlobals} = ctx.state;
  var patterns = [];
  const { uid } = ctx.props.user.user;
  if(ctx.identical(channelEnd))
  {
    var duration = [];
    var transition_next = []
    var i_save = -1;
    for (var j = 0; j < channelEnd.length; j++) {
      channelEnd[j] = false;

    }
    _.each(items, function(d, i, j){
      if(d.uid === uid && d.matName === activeMatrix)
      {
        i_save = _.indexOf(Object.values(items), d);
        patterns = d.patterns;

      }
    })

    const nextObj = Object.values(items)[(i_save+1)%Object.values(items).length];
    const model = fetchModel(ctx.state.modelName);
    _.forEach(nextObj.durations, function(d, i){
      duration.push(d);

    });

    updateMatrix(patterns, values, nextObj, transition, duration,storedGlobals);
    store.dispatch(globalStore(storedGlobals));
    ctx.setState({ activeMatrix : nextObj.matName, channelEnd : channelEnd, transition: nextObj.transitions, storedGlobals: nextObj.globals});

    for (var i = 0; i < channelEnd.length; i++) {
      channelEnd[i] = false;
    }
  }
}

enableSongmode(){
  this.setState({ songmodeActive : true});
}
disableSongmode(){
  this.setState({ songmodeActive : false});
}

////////////////////////////// TIMER STARTS ////////////////////////////

startTimer() {
  const ctx = this;
  const {channels, steps, play} = ctx.state;

  var temp = [];
  for (var i = 0; i < channels.length; i++) {
    if(isNaN(parseFloat(ctx.props.timer.timer[i].duration)))
      temp.push(channels[i]);
  }
  if(temp.length === 0){
    for (var i = 0; i < channels.length; i++) {
      if(!isNaN(parseFloat(ctx.props.timer.timer[i].duration)) && parseFloat(ctx.props.timer.timer[i].duration) >= 1.) {
        startIndividualTimer(i, ctx.props.timer.timer[i].duration,steps);
        ctx.setState({play:true});
      }
    }
    setTimeout(function() {
      ctx.setState({play: true});
      console.log('button press timeout -- start');
    },600);
  }
  else {
    alert("Invalid duration values for: " + temp.toString())
  }
}

stopTimer() {
  const ctx = this;
  const {channels, play} = ctx.state;
  for (var i = 0; i < channels.length; i++) {
    store.dispatch(stopIndividualTimer(i));
    ctx.setState({play:false});
  }
  setTimeout(function() {
    ctx.setState({play: false});
    console.log('button press timeout -- stop');
  },600);
}

pauseTimer() {
  const ctx = this;
  const {channels, play} = ctx.state;
  for (var i = 0; i < channels.length; i++) {
    store.dispatch(pauseIndividualTimer(i));
    ctx.setState({play:false});
  }
  setTimeout(function() {
    ctx.setState({play: false});
    console.log('button press timeout -- pause');
  },600);
}
////////////////////////////// TIMER ENDS ////////////////////////////



////////////////////////////// HANDLERS ////////////////////////////
handleSubmit = event => {
  const body=event.target.value
  const ctx=this;
  const {scPattern, tidalServerLink, tidalOnClickClass }=ctx.state;
  console.log(tidalOnClickClass);
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.setState({tidalOnClickClass: ' Executed'});
    console.log(tidalOnClickClass);
    setTimeout(function(){ ctx.setState({tidalOnClickClass: ' '}); }, 500);
    ctx.sendScPattern(tidalServerLink, scPattern);
  }
}


handleConsoleSubmit = event => {
  const body = event.target.value;
  const ctx = this;
  const {tidalServerLink, tidalOnClickClass} = ctx.state;
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.setState({tidalOnClickClass: ' Executed'});
    console.log(tidalOnClickClass);
    setTimeout(function(){ ctx.setState({tidalOnClickClass: ' '}); }, 500);
    ctx.consoleSubmit(tidalServerLink, body);
  }
}

handleGlobalTransformations = event => {
  const body=event.target.value
  const ctx=this;
  const {globalTransformations}=ctx.state;
  var temp = body;
  ctx.setState({globalTransformations:temp});
}

handleGlobalCommands = event => {
  const body=event.target.value;
  const ctx=this;
  const {globalCommands}=ctx.state;
  var temp = body;
  ctx.setState({globalCommands:temp});
}

updateDur = ({target : {value, id}}) => {
  const ctx = this;
  const {channels,steps} = ctx.state;
  const {timer} = ctx.props;
  var _index = _.indexOf(channels,id);

  if(!isNaN(parseFloat(value)) && parseFloat(value) >= 2.) {
    store.dispatch(updateTimerduration(_index,value,steps));
  } else {
    console.error("Please input numbers only.");
  }
}

_handleKeyPress = event => {

  const ctx=this;
  const {steps, channels, timer, play} = ctx.state;
  const _key = event.target.id;
  var value = event.target.value;
  var _index = _.indexOf(channels, _key);

  if(event.keyCode === 13 && event.ctrlKey){
    if(!isNaN(parseFloat(ctx.props.timer.timer[_index].duration)) && parseFloat(ctx.props.timer.timer[_index].duration) >= 1.) {
      startIndividualTimer(_index, value,steps);
      ctx.setState({play:true});
    }
  }
  else if (event.keyCode === 13 && event.shiftKey){
    store.dispatch(stopIndividualTimer(_index));
  }
}


updateT = ({target : {value, id}}) => {
  const ctx = this;
  const {transition, channels} = ctx.state;
  var _index = _.indexOf(channels, id);
  var temp = transition;
  if(temp){
    temp[_index] = value;
  }
  else {
    temp = [];
  }
  ctx.setState({transition: temp});
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
   ctx.setState({transition:temp});
  }
}


handleSubmitCell = event => {
  const ctx=this;
  const { channels, steps, tidalServerLink, solo, transition, activeMatrix}=ctx.state;
  const { timer, click, patterns }=ctx.props;

  var body = event.target.id;
  var c = _.split(body,',')[0]-1;
  var i = _.split(body,',')[1];
  var text = event.target.value;
  const getScenePatterns = () => {
    var scenePatterns = [];
    const items = this.props[this.state.modelName.toLowerCase()]
    _.each(items, function(d){
      if(d.matName === activeMatrix)
        scenePatterns = d.patterns;
    })
    return scenePatterns;
  }

  if(event.keyCode === 13 && event.ctrlKey){
    store.dispatch(assignTimer(timer.timer[c], steps, i))
    ctx.sendPatterns(tidalServerLink,{[c]: text}, getScenePatterns(),solo, transition, channels,timer.timer[c]);
  }
}
////////////////////////////// HANDLERS ////////////////////////////
updateMatrix(patterns, values, item, transition, duration, storedGlobals) {

  const ctx = this;
  const { steps, channels } = ctx.state;
  const items = this.props[this.state.modelName.toLowerCase()]
  store.dispatch(updateMatrix(patterns, values, item, transition, duration, steps, channels,storedGlobals));

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
    ctx.setState({solo: solo, soloSentinel : solo[_index]});

  }
}

runTidal() {
  const ctx=this;
  const { tidalServerLink } = ctx.state;
  store.dispatch(initMyTidal(tidalServerLink));
}
//
// closeSC() {
//   const ctx=this;
//   const { tidalServerLink } = ctx.state;
//   store.dispatch(initMyTidal(tidalServerLink));
// }

sendPatterns(tidalServerLink, vals, channelcommands, patterns,solo,transition, channels) {
  const ctx = this;
  const {globalCommands,globalTransformations, storedPatterns} = ctx.state;
  store.dispatch(sendPatterns(tidalServerLink, vals, channelcommands, patterns,solo, transition, channels,globalTransformations,globalCommands,storedPatterns));
}
sendSCMatrix(tidalServerLink, vals, patterns) {
  store.dispatch(sendSCMatrix(tidalServerLink, vals, patterns));
}

sendScPattern(tidalServerLink, pattern) {
  store.dispatch(sendScPattern(tidalServerLink, pattern));
}

consoleSubmit(tidalServerLink, value){
  store.dispatch(consoleSubmit(tidalServerLink, value));
}

renderPlayer() {
  const ctx=this;
  const { channels, steps , timer, solo, soloSentinel,transition}=ctx.state;
  const playerClass="Player Player--" + (channels.length + 1.0) + "cols";
  var count = 1;
  const transitionValue = function(c){
    if(ctx.state.transition){
      return ctx.state.transition[_.indexOf(channels, c)];
    }
    else {
      return ''
    }
  };
  return (<div className="Player-holder">
    <div className={playerClass}>
      <div className="playbox playbox-cycle" style={{width:"6%"}}>-</div>
      {_.map(channels, c => {
        return <div className="playbox playbox-cycle" key={c}>{c}<input className = "durInput" style = {{margin: 5}} id = {c} value={ctx.props.timer.timer[_.indexOf(channels, c)].duration}
        onChange = {ctx.updateDur.bind(ctx)} onKeyDown={ctx._handleKeyPress.bind(ctx)}/>
        {!solo[_.indexOf(channels, c)] && <img src={require('../assets/stop@3x.png')}  id = {c}  onClick={ctx.soloChannel.bind(ctx)} height={20} width={20}/>}
        {solo[_.indexOf(channels, c)] && <img src={require('../assets/stop_fill@3x.png')}  id = {c}  onClick={ctx.soloChannel.bind(ctx)} height={20} width={20}/>}
         </div>
      })}
    </div>
    {_.map(Array.apply(null, Array(steps)), ctx.renderStep.bind(ctx))}
    <div className={playerClass}>
      <div className="playbox playbox-cycle" style={{width:"7.5%"}}>T</div>
      {_.map(channels, c => {
        return <input className = "playbox" id = {c} key = {c}
        placeholder={" - "}
        value = {transitionValue(c)}
        style = {{margin: 5}}
        onChange = {ctx.updateT.bind(ctx)}
        onKeyUp={ctx._handleKeyPressT.bind(ctx)}/>
      })}
    </div>
  </div>)
}

renderStep(x, i) {
  const ctx=this;
  const { channels, steps, tidalServerLink, solo, transition, activeMatrix}=ctx.state;
  const { timer, click, patterns }=ctx.props;

  var playerClass="Player Player--" + (channels.length + 1.0) + "cols";

  var colCount=0;

  return <div key={i} className={playerClass}>
    <div className="playbox playbox-cycle" style={{width:"5%"}}>{i+1}</div>
    {_.map(channels, c => {
      const setText=({ target: { value }}) => {
          const {values}=ctx.state;
          if (values[i+1] === undefined) values[i+1]={}
          values[i+1][_.indexOf(channels,c)] = value;
          ctx.setState({values});
      }

      const getValue=() => {
        const values=ctx.state.values;
        if (values[i+1] === undefined || values[i+1][_.indexOf(channels,c)] === undefined) return ''
        return values[i+1][_.indexOf(channels,c)];
      }

      const textval=getValue();

      const index=channels.length*i+colCount++;

      const mapNumbers =(value, istart, istop, ostart, ostop) => {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
      }

      const cellHeight = 65/steps;
      //Timer Check
      var _index = _.indexOf(channels,c);
      const currentStep = ctx.props.timer.timer[_index].current % steps;
      var individualClass = "playbox";
      var translateAmount = 0;
      var ctrans = 'translate(0px, '+translateAmount+'px)';
      var durstr = ctx.props.timer.timer[_index].duration + 's ease-in-out';
      var css = {
          height: cellHeight+'vh',
          webkittransition: durstr,
          moztransition: durstr,
          otransition: durstr,
          transform: ctrans
      }
      if (i === currentStep) {
        individualClass += " playbox-active";
        translateAmount = cellHeight;
      }
      if (ctx.props.timer.timer[_index].isActive === true) {
        individualClass += " playbox-highlight";
      }
      // dynamic text size
      // const textSize = textval.length > 10 ? Math.max( 1, mapNumbers(textval.length, 10, 30, 1, 0.65)) : 1;
      return <div className={individualClass} style={css} key={c+'_'+i}>
        <textarea type="text" style={{fontSize: '1vw'}}value={textval} onChange={setText} id = {c+','+i} onKeyUp = { ctx.handleSubmitCell.bind(ctx)}/>
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
  var patterns = [],
      duration = [],
      globals = [];
  const { matName, activeMatrix, values, sceneIndex, transition,storedGlobals  } = ctx.state;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  const { uid } = ctx.props.user.user;
  const propstoredGlobals = ctx.props.globalparams.storedGlobals;
  // gets the duration array
  _.map(ctx.props.timer.timer, (obj, i) => {duration.push(obj.duration)})
  globals = storedGlobals;
  if(uid !== null && uid !== undefined){
    _.each(items, function(d){
      if(d.uid === uid && d.matName === activeMatrix){
        patterns = d.patterns;
      //  globals = d.globals;
      }
    })
    if ( matName.length >= 1) {
      var snd = Object.values(items).length;
      console.log(storedGlobals);
      fbcreateMatrix(ctx.state.modelName, { matName, patterns, values, sceneIndex: snd, uid, transitions: transition, durations: duration, storedGlobals});
      ctx.setState({sceneIndex: snd});
    }
    else {
      alert("Scene title should be longer than 1 characters");
    }

    ctx.setState({activeMatrix: matName});
  }
}

reorder (index,flag){
  const ctx = this;
  const { matName, values, sceneIndex } = ctx.state;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  if(ctx.props.user !== null && ctx.props.user !== undefined){
    const vals = _.takeWhile(Object.values(items), function (d) { return d.uid === ctx.props.user.user.uid });
    if(vals !== undefined){
      const len = vals.length;
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
            var upPatterns = vals[upIndex].patterns;
            var upUID = vals[upIndex].uid;
            var downMatName = vals[index].matName;
            var downValues = vals[index].values;
            var downPatterns = vals[index].patterns;
            var downUID = vals[index].uid;

            fborder(ctx.state.modelName, {matName: upMatName,   patterns: upPatterns, values: upValues, sceneIndex: index, uid: upUID}, vals[upIndex].key);
            fborder(ctx.state.modelName, {matName: downMatName, patterns: downPatterns, values: downValues, sceneIndex: upIndex, uid: downUID}, vals[index].key);
          }
        }
        else if (flag === "down") {
          if (vals[index].sceneIndex === index){
            var downIndex = index + 1;
            var downMatName = vals[downIndex].matName;
            var downPatterns = vals[downIndex].patterns;
            var downValues = vals[downIndex].values;
            var downUID = vals[downIndex].uid;
            var upMatName = vals[index].matName;
            var upPatterns = vals[index].patterns;
            var upValues =  vals[index].values;
            var upUID = vals[index].uid;

            console.log(downMatName ,': ', downPatterns);
            console.log(upMatName, ': ', upPatterns);

            fborder(ctx.state.modelName, {matName: downMatName, patterns: downPatterns, values: downValues, sceneIndex: index, uid: downUID}, vals[downIndex].key);
            fborder(ctx.state.modelName, {matName: upMatName,   patterns: upPatterns, values: upValues, sceneIndex: downIndex, uid: upUID}, vals[index].key);
          }
        }
      }
    }
  }
}


renderItem(item, dbKey, i) {
  const ctx = this;
  const { values, activeMatrix, transition,storedGlobals} = ctx.state;
  const { patterns } = ctx.props;

  // gets the duration array
  var duration = [];
  var sglobals = [];
  const model = fetchModel(ctx.state.modelName);
  _.forEach(item.durations, function(d, i){
    duration.push(d);
  });

  const updateMatrix = () => {
    if(sglobals === undefined){
      sglobals = [];
    }
    ctx.setState({ activeMatrix: item.matName, matName: item.matName, sceneSentinel: true, transition: item.transitions, storedGlobals: item.storedGlobals, globalTransformations: '', globalCommands: ''});
    console.log(item.storedGlobals);
    ctx.updateMatrix(patterns, values, item, transition, duration,item.storedGlobals);
    store.dispatch(globalStore(item.storedGlobals));
    //console.log(storedGlobals);
  }

  const handleDelete = ({ target: { value }}) => {
    if (confirm('Are you sure you want to delete this thing?')) {
      const payload = { key: dbKey };
      fbdelete(ctx.state.modelName, payload);

      // re-order all items after delete successfull
      Firebase.database().ref("/matrices").once('child_removed').then(function(oldChildSnapshot) {
        const items = ctx.props[ctx.state.modelName.toLowerCase()];
        ctx.setState({sceneIndex: (Object.values(items).length)});
        _.forEach(Object.values(items), function(d, i){
          fborder(ctx.state.modelName, {matName: d.matName, patterns: d.patterns, values: d.values, sceneIndex: i}, d.key);
        });
      }, function(error) {
        console.error(error);
      });
    }
  }

  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  return item.key && (
      <div key={item.key} className="matrices" >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '1px'}}>
          <button onClick={handleDelete}>{'x'}</button>
          {activeMatrix === item.matName && <button className={'buttonSentinel'} onClick={updateMatrix} style={{ color: 'rgba(255,255,102,0.75)'}}>{item.matName}</button>}
          {activeMatrix !== item.matName && <button className={'buttonSentinel'} onClick={updateMatrix} style={{ color: '#ddd'}}>{item.matName}</button>}
          {item.sceneIndex !== 0 && <button onClick={ctx.reorder.bind(ctx,item.sceneIndex, 'up')}>{'↑'} </button>}
          {item.sceneIndex !== Object.values(items).length-1 && <button onClick={ctx.reorder.bind(ctx,item.sceneIndex, 'down')}>{'↓'}</button>}
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
  for (var i = 0; i < channels.length*steps; i++) {
      values [i] = [];
  }
  ctx.setState({values});

}

toggleCanvas(){
  const ctx = this;
  ctx.setState({isCanvasOn: !ctx.state.isCanvasOn});
}

renderMenu(){
  const ctx=this;
  const { tidal, timer, click, patterns }=ctx.props;
  const { play, values, steps, channels}=ctx.state;

  const loginGG = () => {
    store.dispatch(GitHubLogin())
  }
  const fblogout = () => {
    this.setState({username: ''});
    store.dispatch(logout())
  }

  return   <div className="Tidal" style={{margin: '5px'}}>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
      User
      {ctx.props.user.user.email && <button className={'buttonSentinel'} id={'logout'} onClick={fblogout}>Logout | {ctx.props.user.user.name}</button>}
      {!ctx.props.user.user.email && <button className={'buttonSentinel'} id={'login'} onClick={loginGG}>Login</button>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
     {!tidal.isActive && <img src={require('../assets/sc@2x.png')} onClick={ctx.runTidal.bind(ctx)} role="presentation" height={32} width={32}/>}
     {tidal.isActive && <img src={require('../assets/sc_running@2x.png')} role="presentation" height={32} width={32}/>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
    {!play && <img src={require('../assets/play@3x.png')} onClick={ctx.startTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
    {play && <div> <img src={require('../assets/pause@3x.png')} onClick={ctx.pauseTimer.bind(ctx)} role="presentation" height={32} width={32}/>
                   <img src={require('../assets/stop@3x.png')} onClick={ctx.stopTimer.bind(ctx)} role="presentation" height={32} width={32}/> </div>}

    </div>

    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
    <a href="https://github.com/cannc4/Siren">0.2</a>
    </div>

  </div>
}

//onClick={ctx.closeSC.bind(ctx)}

handleglobalKeys = event => {
  const ctx = this;
  const {steps, channels, timer, play} = ctx.state;
  if(event.keyCode > 48 && event.keyCode < 58 && event.ctrlKey){
    var _index = event.keyCode - 49;
    if(_index < channels.length){
      if(!isNaN(parseFloat(ctx.props.timer.timer[_index].duration)) && parseFloat(ctx.props.timer.timer[_index].duration) >= 1.) {
        startIndividualTimer(_index, ctx.props.timer.timer[_index].duration, steps);
        ctx.setState({play: true});
      }
    }
  }
  else if(event.keyCode > 48 && event.keyCode < 58 && event.shiftKey){
    var _index = event.keyCode - 49;
    if(_index < channels.length) {
      stopIndividualTimer(_index, ctx.props.timer.timer[_index].duration, steps);
    }
  }
  // Start/stop all timers with ctrl/shift + space
  else if (event.keyCode === 32 && event.ctrlKey){
    ctx.startTimer();
  }
  else if (event.keyCode === 32 && event.shiftKey){
    ctx.stopTimer();
  }

  //Scene bindings
  else if (event.keyCode === 32 && event.shiftKey){
    ctx.stopTimer();
  }
}

updateGlobalsTest(){
  const ctx = this;
  const {globalTransformations,globalCommands,storedGlobals} = ctx.state;
  var ttm = Object.values(storedGlobals[_.random(0,storedGlobals.length)]);
  console.log(storedGlobals);
  store.dispatch(globalUpdate(ttm[0],ttm[1]));
  ctx.setState({globalTransformations:ttm[0], globalCommands: ttm[1]})
}

clicked = event => {
  const ctx=this;
  const {pressed,globalTransformations,globalCommands,storedGlobals}=ctx.state;

  if (event.target.id === 0){
    ctx.SetState({globalTransformations:'', globalCommands: ''});
  }
  else {
    console.log(storedGlobals);
    var ttm = Object.values(storedGlobals[event.target.id]);
    store.dispatch(globalUpdate(ttm[1],ttm[0]));
    ctx.setState({globalTransformations:ttm[1], globalCommands: ttm[0]})
  }

}
record = event => {
  const ctx=this;
  const {pressed,globalTransformations,globalCommands,storedGlobals}=ctx.state;
  var ns;
  var temp = {transform: globalCommands, command:globalTransformations};
  console.log(storedGlobals);
  if (storedGlobals === undefined){
    ns = [];
    ns.push(temp);
  }
  else {
    ns = storedGlobals;
    ns.push(temp);
  }
  ctx.setState({storedGlobals:ns})
  store.dispatch(globalStore(ns));
}

handleUpdatePatterns = event => {
  const body = event.target.value;
  const ctx = this;
  const {tidalServerLink,storedPatterns,globalCommands, globalTransformations,channels, transition}=ctx.state;
  if(event.keyCode === 13 && event.ctrlKey){
  ctx.updatePatterns(tidalServerLink,storedPatterns,globalTransformations, globalCommands,channels, transition);
    }
}

updatePatterns(tidalServerLink,storedPatterns,globalTransformations, globalCommands,channels, transition) {
  const ctx = this;
  var tempAr = [] ;
  for (var i = 0; i < storedPatterns.length; i++) {
    if(i !== channels.length){
      console.log(channels.length);
      if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
        tempAr[i] = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
        if(transition[i] !== '' && transition[i] !== undefined){
          tempAr[i] = 'd' + channels[i] + '$' + globalCommands + tempAr[i] + globalTransformations;
          console.log(tempAr[i]);
          ctx.consoleSubmit(tidalServerLink, tempAr[i]);
          //infinite loop if these lines are commmented out(?)
          //store.dispatch(globalUpdate(globalCommands,globalTransformations));
          //ctx.setState({globalTransformations:globalTransformations, globalCommands:globalCommands});

        }
        else {
          tempAr[i] = 'd' + channels[i] + '$' + globalCommands + tempAr[i] + globalTransformations;
          ctx.consoleSubmit(tidalServerLink, tempAr[i]);
          //infinite loop if these lines are commmented out(?)
          //store.dispatch(globalUpdate(globalCommands,globalTransformations));
          //ctx.setState({globalTransformations:globalTransformations, globalCommands:globalCommands})
        }
      }
    }
  }
}

render() {
  const ctx=this;
  const { timer}=ctx.props;
  const { scPattern, channels, songmodeActive, activeMatrix,storedPatterns,pressed, storedGlobals,globalTransformations,globalCommands}=ctx.state

  const updateScPattern = event  => {
    ctx.setState({scPattern: event.target.value})
  }

  const items = ctx.props[ctx.state.modelName.toLowerCase()];

  var historyOptions = {
      mode: '_rule',
      theme: '_style',
      fixedGutter: false,
      scroll: true,
      styleSelectedText:true,
      showToken:true,
      lineWrapping: true,
      showCursorWhenSelecting: true,
      readOnly: true
  };

  return <div >
  <div className={"Home cont"}>
  {ctx.state.isCanvasOn && <Simple width={window.innerWidth} height={window.innerHeight} timer={timer}/>}
  <Layout fill='window'>
      <Layout layoutWidth={120}>
        <div id="matrices" style={{width: '100%', height: '1000px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginLeft: '10px'}}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '15px'}}>
            <input className={'newPatternInput'} placeholder={'New Scene Name'} value={ctx.state.matName} onChange={ctx.changeName.bind(ctx)}/>
            {this.state.sceneSentinel && <button onClick={ctx.addItem.bind(ctx)}>Update</button>}
            {!this.state.sceneSentinel && <button onClick={ctx.addItem.bind(ctx)}>Add</button>}
            <button onClick={ctx.clearMatrix.bind(ctx)}>Clear Matrix</button>
          </div>
          <div>
            {!songmodeActive && <button className={'buttonSentinel'} onClick={ctx.enableSongmode.bind(ctx)}>Start Songmode</button>}
            {songmodeActive && <button className={'buttonSentinel'} onClick={ctx.disableSongmode.bind(ctx)}>Stop Songmode</button>}
          </div>
          <div className={'sceneList'} style={{ width: '100%'}}>
            <ul style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '0', margin: '0'}}>
              {this.props.user.user.name && ctx.renderItems(items)}
              {!this.props.user.user.name && <div className={'buttonSentinel'} style={{ color: 'rgba(255,255,102,0.75)'}}>Please login to see saved scenes.</div>}
            </ul>
          </div>
        </div>
      </Layout>
      <LayoutSplitter />
      <Layout layoutWidth='flex'>
        <Layout layoutHeight={'flex'}>
          {ctx.renderPlayer()}
        </Layout>
        <LayoutSplitter />
        <Layout layoutHeight={250}>
          <Layout layoutWidth={150}>
            {ctx.renderMenu()}
          </Layout>
          <LayoutSplitter />
          <Layout layoutWidth={250}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
              <p>> Globals</p>
              <input className="defaultPatternHistoryArea" key={'globaltransform'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalTransformations.bind(ctx)} value = {globalTransformations} placeholder="Global Transformation "/>
              <input className="defaultPatternHistoryArea" key={'globalcommand'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalCommands.bind(ctx)} value = {globalCommands} placeholder="Global Command " />

              {_.map(storedGlobals, (c, i) => {
                 return <Button id={i}  pressed={pressed} onClick={ctx.clicked.bind(ctx)}  activeStyle={{position:'relative', top: 1}} >{i}</Button>
               })}
               <Button onClick={ctx.record.bind(ctx)} activeStyle={{position:'relative', top: 2}} >Rec< /Button>
            </div>
          </Layout>
          <LayoutSplitter />
          <Layout layoutWidth={250}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
              <p>> Console</p>
              <textarea className={"defaultPatternArea" + ctx.state.tidalOnClickClass} key={'tidalsubmit'} onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder="Tidal (Ctrl + Enter)"/>
              <textarea className="defaultPatternHistoryArea" key={'scsubmit'} onKeyUp={ctx.handleSubmit.bind(ctx)} onChange={updateScPattern} value={scPattern}  placeholder={'SuperCollider (Ctrl + Enter) '} />
            </div>
          </Layout>
          <LayoutSplitter />
          <Layout layoutWidth={'flex'}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
             <p>> Pattern History</p>
             {_.map(channels, (c, i) => {
                return <CodeMirror key={i} className={'defaultPatternHistoryArea'} onKeyUp={null} name={"defaultPatternArea"} value={storedPatterns[_.indexOf(channels, c)]} options={historyOptions}/>
              })}
            </div>
          </Layout>
        </Layout>
      </Layout>
      <LayoutSplitter />
      <Layout layoutWidth={250}>
        <div className="Patterns" >
          <div className="PatternsColumn" >
            <Patterns active={activeMatrix}/>
          </div>
        </div>
        </Layout>
      </Layout>
    </div>
  </div>
  }
}
export default connect(state => state)(Home);
