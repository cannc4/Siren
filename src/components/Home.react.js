
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';
import io from 'socket.io-client'
// const version = JSON.parse(require('fs').readFileSync('../../package.json', 'utf8')).version

import { initMyTidal,sendScPattern, sendSCMatrix, sendPatterns,
      sendGlobals,consoleSubmitHistory, consoleSubmit, fbcreateMatrix,
      fbdelete, fborder, fetchModel, updateMatrix,globalUpdate,
      chokeClick,startClick,stopClick,globalStore, changeUsername,continousPattern,
      fbfetchscenes, GitHubLogin, logout,fbupdateglobalsinscene,
      fbcreatechannelinscene} from '../actions'


import {Layout, LayoutSplitter} from 'react-flex-layout';
import NumberEditor from 'react-number-editor';
import Patterns from './Patterns.react';
import Channels from './Channels.react';
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

var themeButton = {
    style : {borderWidth: 0.8, borderColor: 'rgba(255,255,102,0.15)'} ,
    disabledStyle: { background: 'gray'},
    overStyle: { background: 'rgba(255,255,102,0.15)' },
    activeStyle: { background: 'rgba(255,255,102,0.15)' },
    pressedStyle: {background: 'green', fontWeight: 'bold'},
    overPressedStyle: {background: 'rgba(255,255,102,1)', fontWeight: 'bold'}
}
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
      scPattern: '',
      click : {flag:0,
              times:0,
              current:null,
              isActive:false},
      activeMatrix: '',
      songmodeActive: false,
      sceneIndex: '',
      channelEnd :[],
      sceneSentinel: false,
      parvalues: '',
      globalCommands: '',
      globalTransformations: '',
      globalChannels: '',
      username: '',
      storedPatterns: [],
      storedGlobals: [{transform:'', command: ''}],
      isCollapsed:[],
      tidalOnClickClass:  ' ',
      pressed : false,

      solo : [],
      soloSentinel: false,
      transition: [],
      steps: 8,
      channels: [],
      values: {}
    }
  }
//Clock for Haskell
componentDidMount(props,state){
  const ctx = this;
  var socket = io('http://localhost:3003/'); // TIP: io() with no args does auto-discovery
  socket.on("osc", data => {

    store.dispatch(startClick());
    console.log(data);
  })
  socket.on("dc", data => {
    store.dispatch(stopClick());
  })
}


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

  const ctx=this;
  var tempEnd = [];
  const { channelEnd, channels , steps , solo, storedGlobals,storedPatterns, isCollapsed}=ctx.state;
  for (var i = 0; i < channels.length; i++) {
    isCollapsed[i] = false;
    storedPatterns[i] = '';

   tempEnd[i] = false
   solo[i] = false;

   storedGlobals[0] = {transform: '', command: ''}
   ctx.setState({storedGlobals : storedGlobals})

 }
 ctx.setState({channelEnd : tempEnd});
 ctx.setState({storedPatterns : storedPatterns});
}


// componentDidUpdate(props, state) {
//   console.log();
//   var runNo = [];
//   const ctx=this;
//   const { patterns, timer, click}=props;
//   const {channelEnd, steps, tidalServerLink, values, channels, activeMatrix, songmodeActive, sceneEnd, solo, transition, storedPatterns,storedGlobals,click }=state;
//   console.log(ctx.props);
//   for (var i = 0; i < channels.length; i++) {
//     if (ctx.props.timer.timer[i].isActive) {
//       runNo[i] = (ctx.props.timer.timer[i].current % steps) + 1;
//       if(values[runNo[i]]!== undefined){
//         const vals = values[runNo[i]][i];
//         const channel = channels[i];
//         if (vals !== undefined) {
//           if (channel !== 'G') {
//             const obj = {[channel]: vals};
//             var scenePatterns = [];
//             const items = this.props[this.state.modelName.toLowerCase()]
//             _.each(items, function(d){
//               if(d.matName === activeMatrix)
//               scenePatterns = d.patterns;
//             })
//             ctx.sendPatterns(tidalServerLink, obj , scenePatterns,solo, transition, channels,timer.timer[i]);
//           }
//           else{
//
//             console.log('here');
//             ctx.sendGlobals(tidalServerLink,storedPatterns,storedGlobals, vals,channels);
//             }
//           }
//
//
//       }
//
//       if(ctx.props.timer.timer[i].current % steps === steps-1){
//         if(songmodeActive){
//           channelEnd[i] = true;
//           ctx.setState({channelEnd : channelEnd});
//           store.dispatch(pauseIndividualTimer(i))
//
//           if(ctx.identical(channelEnd ) === true)
//           {
//             ctx.progressMatrices( ctx.props[ctx.state.modelName.toLowerCase()]);
//             ctx.stopTimer();
//             ctx.startTimer();
//           }
//         }
//       }
//     }
//   }
// }
componentDidUpdate(props, state) {
  console.log();
  var runNo = [];
  const ctx=this;
  const { patterns,  click}=props;
  const {channelEnd, steps, tidalServerLink, values, channels, activeMatrix, songmodeActive, sceneEnd, solo, transition, storedPatterns,storedGlobals }=state;
  console.log(ctx.props);
  for (var i = 0; i < channels.length; i++) {
    if (click.isActive) {
      runNo[i] = (click.current% steps) + 1;
      if(values[runNo[i]]!== undefined){
        const vals = values[runNo[i]][i];
        const channel = channels[i];
        if (vals !== undefined) {
          if (channel !== 'G') {
            const obj = {[channel]: vals};
            var scenePatterns = [];
            const items = this.props[this.state.modelName.toLowerCase()]
            _.each(items, function(d){
              if(d.matName === activeMatrix)
              scenePatterns = d.patterns;
            })
            ctx.sendPatterns(tidalServerLink, obj , scenePatterns,solo, transition, channels,click);
          }
          else{

            console.log('here');
            ctx.sendGlobals(tidalServerLink,storedPatterns,storedGlobals, vals,channels);
            }
          }


      }
      //
      // if(ctx.props.timer.timer[i].current % steps === steps-1){
      //   if(songmodeActive){
      //     channelEnd[i] = true;
      //     ctx.setState({channelEnd : channelEnd});
      //     store.dispatch(pauseIndividualTimer(i))
      //
      //     if(ctx.identical(channelEnd ) === true)
      //     {
      //       ctx.progressMatrices( ctx.props[ctx.state.modelName.toLowerCase()]);
      //       ctx.stopTimer();
      //       ctx.startTimer();
      //     }
      //   }
      //}
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
  const { click } = ctx.props;
  const { channelEnd, values, activeMatrix, steps, songmodeActive, transition, channels,storedGlobals} = ctx.state;
  var patterns = [];
  const { uid } = ctx.props.user.user;
  if(ctx.identical(channelEnd))
  {
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


    updateMatrix(patterns, values, nextObj, transition,storedGlobals);
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
  const {channels, steps,  click} = ctx.state;
  var temp = click;
  temp.isActive = true;
  ctx.setState({click:temp});
  store.dispatch(chokeClick());
}

stopTimer() {
  const ctx = this;
  const {channels, steps, click} = ctx.state;
  var temp = [];
  temp = click;
  temp.isActive = false;
  ctx.setState({click:temp});
  store.dispatch(chokeClick());
}

pauseTimer() {
  const ctx = this;
  const {channels, click} = ctx.state;

}
////////////////////////////// TIMER ENDS ////////////////////////////



////////////////////////////// HANDLERS ////////////////////////////
//SuperCollider
handleSubmit = event => {
  const body=event.target.value
  const ctx=this;
  const {scPattern, tidalServerLink, tidalOnClickClass }=ctx.state;
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.setState({tidalOnClickClass: ' Executed'});
    setTimeout(function(){ ctx.setState({tidalOnClickClass: ' '}); }, 500);
    ctx.sendScPattern(tidalServerLink, scPattern);
  }
}

//GHC
handleConsoleSubmit = event => {
  const body = event.target.value;
  const ctx = this;
  const {tidalServerLink, tidalOnClickClass, storedPatterns,channels} = ctx.state;
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.setState({tidalOnClickClass: ' Executed'});
    setTimeout(function(){ ctx.setState({tidalOnClickClass: ' '}); }, 500);
    console.log();
    ctx.consoleSubmitHistory(tidalServerLink, body,storedPatterns,channels);
  }
}

handleGlobalTransformations = event => {
  const body=event.target.value
  const ctx=this;
  const {globalTransformations}=ctx.state;
  var temp = body;
  ctx.setState({globalTransformations:temp});
}


handleGlobalChannels = event => {
  const body=event.target.value
  const ctx=this;
  const {globalChannels}=ctx.state;
  var temp = body;
  ctx.setState({globalChannels:temp});
}

handleGlobalCommands = event => {
  const body=event.target.value;
  const ctx=this;
  const {globalCommands}=ctx.state;
  var temp = body;
  ctx.setState({globalCommands:temp});
}




handleSubmitCell = event => {
  const ctx=this;
  const { channels, steps, tidalServerLink, solo, transition, activeMatrix}=ctx.state;
  const { click, patterns }=ctx.props;

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
    ctx.sendPatterns(tidalServerLink,{[c]: text}, getScenePatterns(),solo, transition, channels,click);
  }
}
////////////////////////////// HANDLERS ////////////////////////////
updateMatrix(patterns, values, item, transition, storedGlobals) {

  const ctx = this;
  const { steps, channels } = ctx.state;
  const items = this.props[this.state.modelName.toLowerCase()]
  store.dispatch(updateMatrix(patterns, values, item, transition, steps, channels,storedGlobals));

}

soloChannel =  ({target : {id}}) => {
  const ctx = this;
  const {channels,solo,soloSentinel,storedPatterns,tidalServerLink} = ctx.state;
  var _index = _.indexOf(channels,id);
  var solopattr = "solo $" + storedPatterns[_index];
  if(_index !== -1 ){
    for (var i = 0; i < solo.length; i++) {
      if(_index !== i)
        solo[i] = false;
    }
    if (solo[_index] === false){
      ctx.consoleSubmit(tidalServerLink, solopattr);
    }
    else {
      _.forEach(storedPatterns, function(pat, i){
        if (i !== _index){
          ctx.consoleSubmit(tidalServerLink, storedPatterns[i]);
        }
      });
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
consoleSubmitHistory(tidalServerLink, value,storedPatterns,channels){
  store.dispatch(consoleSubmitHistory(tidalServerLink, value, storedPatterns,channels));
}
changeCollapse(k){
  const ctx = this;
  const {isCollapsed} = ctx.state;
  isCollapsed[k]= !isCollapsed[k]
  ctx.setState({isCollapsed : isCollapsed});
}

addChannel() {
  const ctx = this
  const {values, activeMatrix } = ctx.state;
  _.each(Object.values(ctx.props["matrices"]), function(d){
    if(d.matName === activeMatrix){
      fbcreatechannelinscene('Matrices', {type:'d', name:'d1', values:[], transitions: '', steps: 8 }, d.key);
    }
  })
}


renderPlayer() {
  const ctx=this;
  const { channels, steps , click, solo, soloSentinel,transition,isCollapsed,activeMatrix}=ctx.state;
  return (
    <div className="Player-holder">
    {<Button onClick={ctx.addChannel.bind(ctx)} theme = {themeButton} activeStyle={{position:'relative', top: 1}}></Button>}
    <Channels active = {activeMatrix}/>
  </div>
)
}


changeName({target: { value }}) {
  const ctx = this;
  ctx.setState({ matName: value , sceneSentinel: false});
}

addItem() {
  const ctx = this;
  var patterns = [],
      globals = [];
  const { matName, activeMatrix, values, sceneIndex, transition,storedGlobals  } = ctx.state;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  const { uid } = ctx.props.user.user;
  const propstoredGlobals = ctx.props.globalparams.storedGlobals;

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
      //console.log(storedGlobals);
      fbcreateMatrix(ctx.state.modelName, { matName, patterns, values, sceneIndex: snd, uid, transitions: transition, storedGlobals});
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
  const { activeMatrix, transition,storedGlobals} = ctx.state;
  const { patterns } = ctx.props;

  var sglobals = [];
  const model = fetchModel(ctx.state.modelName);
  _.forEach(item.storedGlobals, function(d, i){
    sglobals.push(d);
  });
  const updateMatrix = () => {
    if(sglobals === undefined){
      sglobals = [];
    }
    ctx.setState({ activeMatrix: item.matName, matName: item.matName, sceneSentinel: true, transition: item.transitions, storedGlobals: sglobals, globalTransformations: ' ', globalCommands:' '});
    //console.log(item.storedGlobals);
    ctx.updateMatrix(patterns, values, item, transition,sglobals);
    store.dispatch(globalStore(sglobals));
    //console.log(storedGlobals);
  }

  const handleDelete = ({ target: { value }}) => {
    if (confirm('Are you sure you want to delete this?')) {
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
          {activeMatrix === item.matName && <Button className={'buttonSentinel'} onClick={updateMatrix} theme = {themeButton} style={{ color: 'rgba(255,255,102,0.75)'}}>{item.matName}</Button>}
          {activeMatrix !== item.matName && <Button className={'buttonSentinel'} onClick={updateMatrix} theme = {themeButton}  style={{ color: '#ddd'}}>{item.matName}</Button>}
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
  const { tidal, click, patterns }=ctx.props;
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
    {!click.isActive && <img src={require('../assets/play@3x.png')} onClick={ctx.startTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
    {click.isActive && <div> <img src={require('../assets/pause@3x.png')} onClick={ctx.pauseTimer.bind(ctx)} role="presentation" height={32} width={32}/>
                   <img src={require('../assets/stop@3x.png')} onClick={ctx.stopTimer.bind(ctx)} role="presentation" height={32} width={32}/> </div>}

    </div>

    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
    <a href="https://github.com/cannc4/Siren">0.3</a>
    </div>

  </div>
}

clicked = event => {
  const ctx=this;
  const {pressed,globalTransformations,globalCommands,storedGlobals}=ctx.state;
  var temp = {transform: globalTransformations, command: globalCommands};
  var ns,tempgb, tempgbtwo;
  if (event.target.id === 0){
    ctx.SetState({globalTransformations:'', globalCommands: ''});
  }
  else if (event.shiftKey){
    if(storedGlobals[event.target.id]!== undefined){
      ns = storedGlobals;
      ns[event.target.id] = temp;
    }
  }
  else {
    var ttm = Object.values(storedGlobals[event.target.id]);
    if(ttm[0][0] === '#' && ttm[0] !== undefined ){
      tempgb = ttm[0];
      tempgbtwo = ttm[1];
    }
    else{
      tempgb = ttm[1];
      tempgbtwo = ttm[0];
    }
    ctx.setState({globalTransformations:tempgbtwo, globalCommands: tempgb})
  }
}

record = event => {
  const ctx=this;
  const {pressed,globalTransformations,globalCommands,storedGlobals, sceneIndex}=ctx.state;
  var ns;
  var temp = {transform: globalTransformations, command: globalCommands};
  if (storedGlobals === undefined){
    ns = [];
    ns.push(temp);
  }
  else {
    ns = storedGlobals;
    ns.push(temp);
  }

  store.dispatch(globalStore(ns));
  ctx.setState({storedGlobals:ns})
}

handleUpdatePatterns = event => {
  const body = event.target.value;
  const ctx = this;
  const {tidalServerLink,storedPatterns,globalCommands, globalTransformations,channels, transition}=ctx.state;
  if(event.keyCode === 13 && event.ctrlKey){

  ctx.updatePatterns(tidalServerLink,storedPatterns,globalTransformations,globalCommands,channels, transition);
    }
}

sendGlobals(tidalServerLink,storedPatterns,storedGlobals, vals,channels){
  const ctx = this;
  store.dispatch(sendGlobals(tidalServerLink,storedPatterns,storedGlobals, vals,channels));
}


updatePatterns(tidalServerLink,storedPatterns,globalTransformations, globalCommands,channels, transition) {
  const ctx = this;
  const {globalChannels} = ctx.state;
  var tempAr = [] ;
  var gbchan = globalChannels.split(" ");

  if (gbchan[0] === undefined || gbchan[0] === ' ' || gbchan[0] ==='a' ){
    for (var i = 0; i < storedPatterns.length; i++) {
      if(i !== channels.length){
        if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
          tempAr[i] = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
          if(transition[i] !== '' && transition[i] !== undefined){
            tempAr[i] = channels[i]+ '$' + globalTransformations + tempAr[i] + globalCommands;
            ctx.consoleSubmit(tidalServerLink, tempAr[i]);
          }
          else {
            tempAr[i] = channels[i] + '$' + globalTransformations + tempAr[i] + globalCommands;
            ctx.consoleSubmit(tidalServerLink, tempAr[i]);
          }
        }
      }
    }
  }

  else {
  _.forEach( gbchan, function(chan, j){
      var i = parseInt(chan) - 1;
      if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
        tempAr[i] = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
        if(transition[i] !== '' && transition[i] !== undefined){
          tempAr[i] = channels[i]+ '$' + globalTransformations + tempAr[i] + globalCommands;
          ctx.consoleSubmit(tidalServerLink, tempAr[i]);
        }
        else {
          tempAr[i] = channels[i] + '$' + globalTransformations + tempAr[i] + globalCommands;
          ctx.consoleSubmit(tidalServerLink, tempAr[i]);
        }
      }
    });
  }
}

toggle = () => {
  this.setState({ isMenuOpen: !this.state.isMenuOpen });
};

close = () => {
  this.setState({ isMenuOpen: false });
};

click = () => {
  console.log('You clicked an item');
};

tidalcps (value) {
const ctx = this;
const {click } = ctx.props;
const body = value;
var temp = click;
temp.times = body;
ctx.setState({click:temp});
}
render() {
  const ctx=this;
  const {click}=ctx.props;
  const { scPattern, channels, songmodeActive, activeMatrix,storedPatterns,pressed, storedGlobals,globalTransformations,globalCommands, globalChannels}=ctx.state

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
  <Layout fill='window'>
      <Layout layoutWidth={120}>
        <div id="matrices" style={{width: '100%', height: '1500px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginLeft: '10px'}}>
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
        <Layout layoutHeight={300}>
          <Layout layoutWidth={150}>
            {ctx.renderMenu()}
          </Layout>
          <LayoutSplitter />
          <Layout layoutWidth={250}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
              <p>"> Globals"</p>

              <input className="newChannelInput" key={'globalchannel'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalChannels.bind(ctx)} value = {globalChannels} placeholder="Channels "/>
              <input className="defaultPatternHistoryArea" key={'globaltransform'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalTransformations.bind(ctx)} value = {globalTransformations} placeholder="Global Transformation "/>
              <input className="defaultPatternHistoryArea" key={'globalcommand'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalCommands.bind(ctx)} value = {globalCommands} placeholder="Global Command " />
              {_.map(storedGlobals, (c, i) => {
                 return <Button id={i}  pressed={pressed} onClick={ctx.clicked.bind(ctx)}   theme = {themeButton} activeStyle={{position:'relative', top: 1}} >{i}</Button>
               })}
               <Button theme = {themeButton}  onClick={ctx.record.bind(ctx)} activeStyle={{position:'relative', top: 2}} >Rec< /Button>
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
