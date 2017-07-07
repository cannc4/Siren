import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';
import io from 'socket.io-client'
// const version = JSON.parse(require('fs').readFileSync('../../package.json', 'utf8')).version

import { initMyTidal,sendScPattern, sendSCMatrix, sendPatterns,
      sendGlobals,consoleSubmitHistory, consoleSubmit, fbcreateMatrix,
      fbdelete, fborder, fetchModel, updateMatrix,globalUpdate,
      startClick,stopClick,globalStore, changeUsername,continousPattern,
      fbfetchscenes, GitHubLogin, logout,fbupdateglobalsinscene,
      fbcreatechannelinscene, fbupdatechannelinscene,
      createChannel,updateChannel} from '../actions'


import {Layout, LayoutSplitter} from 'react-flex-layout';
import NumberEditor from 'react-number-editor';
import Patterns from './Patterns.react';
import Channels from './Channels.react';
import Firebase from 'firebase';
import store from '../store';
import _ from 'lodash';

import Dropdown from 'react-dropdown'

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

const channelOptions = ['Audio', 'Visual', 'MIDI']

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
      channels_state: [],
      storedPatterns: [],
      storedGlobals: [{transform:'', command: '', selectedChannels: ''}],
      isCollapsed:[],
      tidalOnClickClass:  ' ',
      pressed : false,
      c_type: '',
      c_name: '',
      c_step: '',
      c_id: 0,
      c_transition: ''
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
//
// componentWillMount(props,state){
//   const ctx=this;
//   const channels = ctx.props.channel;
//   const {storedGlobals,storedPatterns}= ctx.state;
//  //
//  //  for (var i = 0; i < channels.length; i++) {
//  //    storedPatterns[i] = '';
//  //    storedGlobals[0] = {transform: '', command: '', selectedChannels: ''}
//  //    ctx.setState({storedGlobals : storedGlobals})
//  // }
//  ctx.setState({storedPatterns : storedPatterns});
// }


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
componentDidUpdate(prevProps, prevState) {
  const ctx = this;
  const {storedPatterns, storedGlobals} = ctx.state;
  if(prevProps !== ctx.props)
    ctx.setState({storedPatterns:ctx.props.globalparams.storedPatterns});


}
identical(array) {
  for(var i = 0; i < array.length ; i++) {
      if(array[i] === false ) {
          return false;
      }
  }
  return true;
}

// TODO : Fix this
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
    store.dispatch(globalStore(storedGlobals, []));
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
  const {storedGlobals, globalChannels}=ctx.state;
  storedGlobals.selectedChannels = body;
  ctx.setState({storedGlobals:storedGlobals, globalChannels:body});
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
updateMatrix(item) {
  const ctx = this;
  store.dispatch(updateMatrix(item));
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
//
// closeSC() {
//   const ctx=this;
//   const { tidalServerLink } = ctx.state;
//   store.dispatch(initMyTidal(tidalServerLink));
// }


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


addChannel() {
  const ctx = this
  const { activeMatrix, c_id, c_type, c_name, c_step, c_transition } = ctx.state;
  var flag = false;

  _.each(Object.values(ctx.props["matrices"]), function(d){
    if(d.matName === activeMatrix) {
      _.each(d.channels, function(c) {
        if(c.name === c_name) {
          alert('"' + c_name + '" already exists in "' + d.matName + '"');
          flag = true;
        }
      })

      if (flag === false){
        var _index=0;
        _.each(d.channels, function(chan,i){
          _index++;
        })
        ctx.setState({ c_id : _index });

        var values = {}
        for(var i = 0; i < c_step; i++){
          values[i] = '';
        }
        console.log();
        var nc = { scene: activeMatrix,
          cid: _index,
          type: c_type,
          name: c_name,
          transition: c_transition,
          step: c_step,
          vals: values
        };
        var obj = fbcreatechannelinscene('Matrices', nc, d.key);
        nc['key'] = obj
        store.dispatch(createChannel(nc));

        ctx.setState({ activeMatrix: d.matName, matName: d.matName });

      } else {
        console.warning('"' + c_name + '" already exists in "' + d.matName + '"');
      }
    }
  })
}

handleChannelName = event => {
  const ctx = this;
  const {c_name} = ctx.state;
  ctx.setState({c_name: event.target.value});
}

handleChannelType = (option) => {
  this.setState( {c_type: option.label} );
}

handleChannelStep = event => {
  const ctx = this;
  const {c_step} = ctx.state;
  ctx.setState({c_step: event.target.value});
}
handleChannelTransition = event => {
  const ctx = this;
  const {c_transition} = ctx.state;
  ctx.setState({c_transition: event.target.value});
}
renderPlayer() {
  const ctx = this;
  const { activeMatrix } = ctx.state;
  var scene_key;
  const scenes = Object.values(ctx.props['matrices']);
  for(var j = 0; j < scenes.length; j++){
    if (scenes[j].matName === activeMatrix) {
      scene_key = scenes[j].key
    }
  }
  return (<Channels active = {activeMatrix} scene_key = {scene_key}/>)
}
// const channelss = ctx.props.channel;
//  {_.map(channelss, function(e){
//   return (<Channels active = {activeMatrix} scene_key = {scene_key} />)
// })}

changeName({target: { value }}) {
  const ctx = this;
  ctx.setState({ matName: value , sceneSentinel: false});
}

addItem() {
  const ctx = this;
  var patterns = [],
      globals = [],
      channels = []

  const { matName, activeMatrix, sceneIndex, storedGlobals } = ctx.state;
  const { uid } = ctx.props.user.user;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  const propstoredGlobals = ctx.props.globalparams.storedGlobals;


  globals = storedGlobals;
  if(uid !== null && uid !== undefined){
    // Get active patterns and channels
    _.each(items, function(d){
      if(d.uid === uid && d.matName === activeMatrix){
        patterns = d.patterns;
        globals = d.globals;
        channels = d.channels;
      }
    })

    // _.each(channels, function(x) {
    //   x.scene = matName
    // })
    //
    if ( matName.length >= 1) {
      var snd = Object.values(items).length;

      fbcreateMatrix(ctx.state.modelName, { matName, patterns, channels, sceneIndex: snd, uid, storedGlobals });
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
  const { activeMatrix, transition, storedGlobals } = ctx.state;
  const { patterns } = ctx.props;

  // const model = fetchModel(ctx.state.modelName);

  var sglobals = [];
  _.forEach(item.storedGlobals, function(d, i){
    sglobals.push(d);
  });

  console.log(sglobals);
  const updateMatrix = () => {
    if(sglobals === undefined){
      sglobals = [];
    }
    ctx.setState({ activeMatrix: item.matName,
      matName: item.matName, sceneSentinel: true,  storedGlobals: sglobals,
      globalTransformations: '', globalCommands:'', globalChannels: '', sceneIndex:item.key});

    ctx.updateMatrix(item);

    store.dispatch(updateChannel(item));

    store.dispatch(globalStore(sglobals,[]));
  }

  const handleDelete = ({ target: { value }}) => {
    if (confirm('Are you sure you want to delete this?')) {
      const payload = { key: dbKey };
      fbdelete(ctx.state.modelName, payload);

      // re-order all items after deleting successfull
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
  var { channel, matrices, user} = ctx.props;
  const { activeMatrix } = ctx.state;

  // Get scene key
  var s_key;
  _.each(matrices, function(scene, i){
    if(scene.uid === user.user.uid && scene.matName === activeMatrix)
    {
      s_key = scene.key;
    }
  })

  _.each(channel, function(ch) {
    _.each(ch.vals, function(d, i){
      ch.vals[i] = '';
    })
    ch.transition = ''
    fbupdatechannelinscene('Matrices', ch, s_key);
  })

}

toggleCanvas(){
  const ctx = this;
  ctx.setState({isCanvasOn: !ctx.state.isCanvasOn});
}

clicked = event => {
  const ctx=this;
  const {pressed,storedGlobals} =ctx.state;
  console.log(ctx.props);
  //const storedGlobals = ctx.props.globalparams.storedGlobals;
  var ns,tempgb, tempgbtwo, tempchan;
  var temp ={globalTransformations:'', globalCommands: '', selectedChannels:''};
  if (event.target.id === 0){
    ctx.SetState({globalTransformations:'', globalCommands: '', selectedChannels:''});
  }
  else if (event.shiftKey){
    if(storedGlobals[event.target.id]!== undefined){
      ns = storedGlobals;
      ns[event.target.id] = temp;
    }
  }
  else {
    var ttm = Object.values(storedGlobals[event.target.id]);
    console.log(ttm);
    // if(ttm[0][0] === '#'){
    //   tempgb = ttm[0];
    //   tempgbtwo = ttm[1];
    //   tempchan = ttm[2];
    // }
    // else{
    //   tempgb = ttm[1];
    //   tempgbtwo = ttm[0];
    //   tempchan = ttm[2];
    // }
    store.dispatch(globalUpdate(ttm[2], ttm[0], ttm[1]));
    storedGlobals.selectedChannels = ttm[1];
    ctx.setState({globalTransformations:ttm[2], globalCommands: ttm[0], storedGlobals: storedGlobals})
  }
}

record = event => {
  const ctx=this;
  const {pressed,globalChannels,globalTransformations,globalCommands,storedGlobals,
        sceneIndex, storedPatterns}=ctx.state;
  var ns;
  var temp = {transform: globalTransformations,
              command: globalCommands,
              selectedChannels:globalChannels};

  if (storedGlobals === undefined){
    ns = [];
    ns[0]  = {transform: '',
              command: '',
              selectedChannels:''};

    ns.push(temp);
  }
  else {
    ns = storedGlobals;
    ns.push(temp);
  }
  var key;
  _.each(ctx.props.matrices, function(m, i){
    if(i === sceneIndex){
      key = m;
    }
  })
  store.dispatch(fbupdateglobalsinscene('Matrices',ns,key.key));
  store.dispatch(globalStore(ns,storedPatterns));
  ctx.setState({storedGlobals:ns})
}

handleUpdatePatterns = event => {
  const body = event.target.value;
  const ctx = this;
  const {tidalServerLink,storedPatterns,globalCommands,
        globalTransformations} = ctx.state;
  const channels = ctx.props.channel;


  if(event.keyCode === 13 && event.ctrlKey){
    ctx.updatePatterns(tidalServerLink,storedPatterns,globalTransformations,
                      globalCommands,channels);
  }
}

sendGlobals(tidalServerLink,storedPatterns,storedGlobals, vals,channels){
  const ctx = this;
  store.dispatch(sendGlobals(tidalServerLink,storedPatterns,storedGlobals,
                            vals,channels));
}


updatePatterns(tidalServerLink,storedPatterns,globalTransformations,
                globalCommands,channels) {
  const ctx = this;
  const {storedGlobals, globalChannels} = ctx.state;

  var tempAr = [] ;
  var gbchan = globalChannels.split(" ");

  if (gbchan === undefined ||gbchan[0] === undefined || gbchan[0] === ' ' || gbchan[0] ==='a' ){

    for (var i = 0; i < storedPatterns.length; i++) {
        if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
          console.log("UPDATE PATTERNS", storedPatterns);
          console.log(storedPatterns[i]);
          var patternbody = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
          var patname = storedPatterns[i].substring(0,_.indexOf(storedPatterns[i], "$")+1 );
          console.log("PAT CHAN:", patname);
          tempAr[i] = patname + globalTransformations + patternbody + globalCommands;
          console.log("BEFORE CONSOLE" , tempAr[i]);
            ctx.consoleSubmit(tidalServerLink, tempAr[i]);

        }
      }
    }

  //
  // else {
  // _.forEach( gbchan, function(chan, j){
  //     var i = parseInt(chan) - 1;
  //     if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
  //       console.log(storedPatterns);
  //       tempAr[i] = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
  //       if(Object.values(channels[i]).transition !== '' && Object.values(channels[i]).transition !== undefined){
  //         tempAr[i] = Object.values(channels[i]).name+ '$' + globalTransformations + tempAr[i] + globalCommands;
  //         ctx.consoleSubmit(tidalServerLink, tempAr[i]);
  //       }
  //       else {
  //         tempAr[i] = Object.values(channels[i]).name + '$' + globalTransformations + tempAr[i] + globalCommands;
  //         ctx.consoleSubmit(tidalServerLink, tempAr[i]);
  //       }
  //     }
  //   });
  // }
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
  const { click }=ctx.props;
  const { scPattern, channels, songmodeActive, activeMatrix, storedPatterns,
          pressed, storedGlobals, globalTransformations, globalCommands,
          globalChannels } = ctx.state
  const { c_type, c_name, c_step, c_transition } = ctx.state;

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
        <Layout layoutHeight={100}>
          <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
           <p>> Pattern History</p>
           {_.map(storedPatterns, (c, i) => {
              return <CodeMirror key={i} className={'defaultPatternHistoryArea'} onKeyUp={null} name={"defaultPatternArea"} value={storedPatterns[i]} options={historyOptions}/>
            })}
          </div>
        </Layout>
        <LayoutSplitter />
        <Layout layoutHeight={275}>
          <Layout layoutWidth={150}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
              <p>> Add Channel</p>

              <Dropdown options={channelOptions} onChange={ctx.handleChannelType.bind(ctx)} value = {c_type} placeholder="Type" />
              <input className="newChannelInput" onChange={ctx.handleChannelName.bind(ctx)} value = {c_name} placeholder="Name "/>
              <input className="newChannelInput" onChange={ctx.handleChannelStep.bind(ctx)} value = {c_step} placeholder="Step "/>
              <input className="newChannelInput" onChange={ctx.handleChannelTransition.bind(ctx)} value = {c_transition} placeholder="Transition (optional)"/>
              <Button className={"newChannelButton"} onClick={ctx.addChannel.bind(ctx)} theme = {themeButton}>Add</Button>
            </div>
          </Layout>
          <LayoutSplitter />
          <Layout layoutWidth={350}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
              <p>> Globals</p>

              <input className="newChannelInput" key={'globalchannel'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalChannels.bind(ctx)} value = {storedGlobals.selectedChannels} placeholder="Channels "/>
              <input className="defaultPatternHistoryArea" key={'globaltransform'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalTransformations.bind(ctx)} value = {globalTransformations} placeholder="Global Transformation "/>
              <input className="defaultPatternHistoryArea" key={'globalcommand'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalCommands.bind(ctx)} value = {globalCommands} placeholder="Global Command " />
              {_.map(storedGlobals, (c, i) => {
                 return <Button id={i} onClick={ctx.clicked.bind(ctx)}   theme = {themeButton} activeStyle={{position:'relative', top: 1}} >{i}</Button>
               })}
               <Button theme = {themeButton}  onClick={ctx.record.bind(ctx)} activeStyle={{position:'relative', top: 2}} >Rec< /Button>
            </div>
          </Layout>
          <LayoutSplitter />
          <Layout layoutWidth={350}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
              <p>> Console</p>
              <textarea className={"defaultPatternArea" + ctx.state.tidalOnClickClass} key={'tidalsubmit'} onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder="Tidal (Ctrl + Enter)"/>
              <textarea className="defaultPatternHistoryArea" key={'scsubmit'} onKeyUp={ctx.handleSubmit.bind(ctx)} onChange={updateScPattern} value={scPattern}  placeholder={'SuperCollider (Ctrl + Enter) '} />
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
