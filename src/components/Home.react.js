import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';
import './Menu.css';
import io from 'socket.io-client'
// const version = JSON.parse(require('fs').readFileSync('../../package.json', 'utf8')).version

import {sendScPattern, sendSCMatrix, sendPatterns,
      sendGlobals,consoleSubmitHistory, consoleSubmit, fbcreateMatrix,
      fbdelete, fborder, updateMatrix,globalUpdate,
      startClick,stopClick,globalStore,fbupdateglobalsinscene,
      fbcreatechannelinscene, fbupdatechannelinscene,
      createChannel, deleteChannel} from '../actions'


import {Layout, LayoutSplitter} from 'react-flex-layout';
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
var MaskedInput = require('react-maskedinput')
var themeButton = {
    style : {borderWidth: 0.8, borderColor: 'rgba(255,255,102,0.15)'} ,
    disabledStyle: { background: 'gray'},
    overStyle: { background: 'rgba(255,255,102,0.15)' },
    activeStyle: { background: 'rgba(255,255,102,0.15)' },
    pressedStyle: {background: 'rgba(255,255,102,0.75)'},
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

const channelOptions = ['SCSynth', 'Visual', 'MIDI']

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
      sceneIndex: '',
      parvalues: '',
      globalCommands: '',
      globalTransformations: '',
      globalChannels: '',
      globalsq:'',
      sqActive:false,
      sqActive_UI:false,
      helperindex:0,
      global_helperindex:0,
      username: '',
      storedPatterns: [],
      storedGlobals: [{transform:'', command: '', selectedChannels: ''}],
      tidalOnClickClass: ' ',
      SCOnClickClass: ' ',
      globalOnClickClass: ' ',
      globalOnSqClass: ' ',
      pressed : [],
      c_type: '',
      c_name: '',
      c_step: '',
      c_id: 0,
      c_transition: '',
      csize: 1
    }
  }

//Clock for Haskell
componentDidMount(props,state){
  const ctx = this;
  var socket = io('http://localhost:3003/'); // TIP: io() with no args does auto-discovery
  socket.on("osc", data => {
    store.dispatch(startClick());
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

componentDidUpdate(prevProps, prevState) {
  const ctx = this;
  const {storedPatterns, storedGlobals, csize} = ctx.state;

  if(prevProps !== ctx.props){
  var temp=0;
  var chans = ctx.props.channel;
  _.each(chans, function(ch,k){
    temp = csize * 10;
  })
  temp = temp.toString().match(/.{1}/g).join(' ');
  ctx.setState({storedPatterns:ctx.props.globalparams.storedPatterns, csize : temp});
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

////////////////////////////// HANDLERS ////////////////////////////
//SuperCollider
handleSubmit = event => {
  const body=event.target.value
  const ctx=this;
  const {scPattern, tidalServerLink, SCOnClickClass }=ctx.state;
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.setState({SCOnClickClass: ' Executed'});
    setTimeout(function(){ ctx.setState({SCOnClickClass: ' '}); }, 500);
    ctx.sendScPattern(tidalServerLink, scPattern);
  }
}

//GHC
handleConsoleSubmit = event => {
  const body = event.target.value;
  const ctx = this;
  const {tidalServerLink, tidalOnClickClass} = ctx.state;
  const storedPatterns = ctx.props.globalparams.storedPatterns;
  const channels = ctx.props.channel;
  console.log(channels);
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.setState({tidalOnClickClass: ' Executed'});
    setTimeout(function(){ ctx.setState({tidalOnClickClass: ' '}); }, 500);
    ctx.consoleSubmitHistory(tidalServerLink, body,storedPatterns,channels);
  }
}


////////////////////////////// HANDLERS ////////////////////////////
updateMatrix(item) {
  const ctx = this;
  store.dispatch(updateMatrix(item));
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

        var nc = { scene: activeMatrix,
          cid: _index,
          type: c_type,
          name: c_name,
          transition: c_transition,
          step: c_step,
          vals: values
        };
        //do a proper check here
        if (c_name === undefined || c_step === undefined ){
          alert('Invalid step or name');
        }
        else{
          var obj = fbcreatechannelinscene('Matrices', nc, d.key);
          nc['key'] = obj
          store.dispatch(createChannel(nc));

          ctx.setState({ activeMatrix: d.matName, matName: d.matName });
        }

      } else {
        console.log('"' + c_name + '" already exists in "' + d.matName + '"');
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

  // Find active scene's key
  var scene_key;
  const scenes = Object.values(ctx.props['matrices']);
  for(var j = 0; j < scenes.length; j++){
    if (scenes[j].matName === activeMatrix) {
      scene_key = scenes[j].key
    }
  }
  return (<Channels active = {activeMatrix}
                    scene_key = {scene_key}/>)
}

changeName({target: { value }}) {
  const ctx = this;
  ctx.setState({ matName: value , sceneSentinel: false});
}

addItem() {
  const ctx = this;
  var patterns = [],
      globals = [],
      channels = []

  const checkSceneName = function(newName, items) {
    if (newName.length < 1) {
      return false;
    }

    _.each(Object.values(items), function(m, i) {
      if (m.matName === newName) {
        return false;
      }
    })
    return true;
  }

  const { matName, activeMatrix, sceneIndex, storedGlobals, pressed } = ctx.state;
  const { uid } =ctx.props.user.user;
  const items =ctx.props[ctx.state.modelName.toLowerCase()];
  const propstoredGlobals = ctx.props.globalparams.storedGlobals;

  globals = storedGlobals;
  if(uid !== null && uid !== undefined){
    // Get active patterns and channels
    // _.each(items, function(d){
    //   if(d.uid === uid && d.matName === activeMatrix){
    //     patterns = d.patterns;
    //     globals = d.storedGlobals;
    //     channels = d.channels;
    //   }
    // })
    // _.each(channels,function(ch){
    //   ch.scene = matName;
    // })

    if ( checkSceneName(matName, items) ) {
      var snd = Object.values(items).length;
      store.dispatch(globalStore(globals, ctx.props.globalparams.storedPatterns));
      fbcreateMatrix(ctx.state.modelName, { matName, patterns, channels, sceneIndex: snd, uid, storedGlobals });
      ctx.setState({sceneIndex: snd, storedGlobals: globals});
      ctx.setState({activeMatrix: matName});
    }
    else {
      alert("Scene title should be unique and longer than 1 character");
    }
  }
}

renderScene(item, dbKey, i) {
  const ctx = this;
  const { activeMatrix, transition, storedGlobals } = ctx.state;
  const { patterns } = ctx.props;

  var sglobals = [];
  _.forEach(item.storedGlobals, function(d, i){
    sglobals.push(d);
  });

  const updateMatrix = () => {
    var gpressed = [];
    _.forEach(item.storedGlobals, function(d, i){
      gpressed[i] = false;
    });

    if(sglobals === undefined){
      sglobals = [];
    }
    ctx.setState({ activeMatrix: item.matName,
      matName: item.matName, sceneSentinel: true,  storedGlobals: sglobals,
      globalTransformations: '', globalCommands:'', globalChannels: '',
      pressed:gpressed, sceneIndex:item.key});

    ctx.updateMatrix(item);

    store.dispatch(globalStore(sglobals,[]));
    store.dispatch(globalUpdate('', '', ''));
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
          fborder(ctx.state.modelName, {matName: d.matName, patterns: d.patterns, channels: d.channels, sceneIndex: i}, d.key);
        });
      }, function(error) {
        console.error(error);
      });

      ctx.setState({activeMatrix: ''})
      _.each(item.channels, function( ch, key ) {
        store.dispatch(deleteChannel(key));
      })
    }
  }

  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  return item.key && (
    <div key={item.key} className="matrices" >
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '1px'}}>
        <button onClick={handleDelete}>{'x'}</button>
        {activeMatrix === item.matName && <Button className={'buttonSentinel'} onClick={updateMatrix} theme = {themeButton} style={{ color: 'rgba(255,255,102,0.75)'}}>{item.matName}</Button>}
        {activeMatrix !== item.matName && <Button className={'buttonSentinel'} onClick={updateMatrix} theme = {themeButton}  style={{ color: '#ddd'}}>{item.matName}</Button>}
      </div>
    </div>
  )
}

renderScenes(items) {
  const ctx = this;
  return _.map(items, ctx.renderScene.bind(ctx));
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

clicked = event => {
  const ctx=this;
  const {pressed, storedGlobals, globalChannels,
        globalCommands,globalTransformations,sceneIndex} =ctx.state;
  const globalparams = ctx.props.globalparams;
  const scenes = ctx.props.matrices;
  var matkey;

  var pr = pressed;
  for(var sp = 0; sp < pr.length; sp++){
    if(parseInt(event.target.id) === sp){
      pr[sp] = true;
    }
    else {
      pr[sp] = false;
    }
  }
  ctx.setState({pressed:pr});

  _.each(scenes , function (sc, i) {
    if(sc.key === sceneIndex){
      ctx.setState({storedGlobals:sc.storedGlobals})
      matkey = sc.key;
    }
  })

  if (event.shiftKey){
    var ttm = storedGlobals;
    ttm[event.target.id] = {transform:'',
              command:'',
              selectedChannels:''};

    fbupdateglobalsinscene('Matrices',ttm,matkey);
    store.dispatch(globalUpdate('', '', ''));
    ctx.setState({globalTransformations:'', globalCommands:'',
                  globalChannels: ''})
  }
  else if (event.altKey){

    var ttm = storedGlobals;
    ttm[event.target.id] = {transform:globalTransformations,
              command:globalCommands,
              selectedChannels:globalChannels};
    fbupdateglobalsinscene('Matrices',ttm,matkey);
    store.dispatch(globalStore(ttm,globalparams.storedPatterns));
    store.dispatch(globalUpdate(globalTransformations, globalCommands, globalChannels));
    ctx.setState({storedGlobals:ttm});
  }

  else {
    var ttm = storedGlobals[event.target.id];
    store.dispatch(globalStore(globalparams.storedGlobals,globalparams.storedPatterns));
    store.dispatch(globalUpdate(ttm.command, ttm.transform, ttm.selectedChannels));
    ctx.setState({globalTransformations:ttm.transform, globalCommands:ttm.command,
                  globalChannels: ttm.selectedChannels, storedGlobals: storedGlobals})
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
    ns[0]  = {transform: '',
              command: '',
              selectedChannels:''};
    ns.push(temp);
  }

  var pr = pressed;
  for(var pk = 0; pk <= storedGlobals.lenght; pk++){
    if(storedGlobals.lenght-1 === pk){
      pr[pk] = true;
    }
    else {
      pr[pk] = false;
    }
  }



  var key;
  _.each(ctx.props.matrices, function(m, i){
    if(i === sceneIndex){
      key = m;
      //tss = m.globalparams;
    }
  })
  fbupdateglobalsinscene('Matrices',ns,sceneIndex);
  store.dispatch(globalStore(ns,storedPatterns));
  ctx.setState({storedGlobals:ns, pressed: pr})

}

handleUpdatePatterns = event => {
  const body = event.target.value;
  const ctx = this;
  const {tidalServerLink,globalCommands,
        globalTransformations,globalOnClickClass} = ctx.state;
  const channels = ctx.props.channel;
  const storedPatterns = ctx.props.globalparams.storedPatterns;

  if(event.keyCode === 13 && event.ctrlKey){
    ctx.setState({globalOnClickClass: ' Executed'});
    setTimeout(function(){ ctx.setState({globalOnClickClass: ' '}); }, 500);
    ctx.updatePatterns(tidalServerLink,storedPatterns,globalTransformations,
                      globalCommands,channels);
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
  ctx.setState({globalChannels:body});
}

handleGlobalCommands = event => {
  const body=event.target.value;
  const ctx=this;
  const {globalCommands}=ctx.state;
  var temp = body;
  ctx.setState({globalCommands:temp});
}

sendGlobals(tidalServerLink,storedPatterns,storedGlobals, vals,channels){
  const ctx = this;
  store.dispatch(sendGlobals(tidalServerLink,storedPatterns,storedGlobals,
                            vals,channels));
}
handleGlobalsqDuration = event => {
  const body=event.target.value
  const ctx=this;
  const {globalsq}=ctx.state;
  ctx.setState({globalsq:body});
}
handleGlobalsq = event => {
  const ctx = this;
  const {sqActive_UI, globalOnSqClass} = ctx.state;
  if(event.keyCode === 13 && event.altKey){
    ctx.setState({sqActive: false, sqActive_UI:false});
    ctx.setState({globalOnSqClass: ''});

    // CSS
    ctx.setState({globalOnSqClass: ' Executed'});
    setTimeout(function(){ ctx.setState({globalOnSqClass: ' '}); }, 500);
    ctx.setState({sqActive_UI:true});
    ctx.updateGlobalSq();
  }
  else if(event.keyCode === 13 && event.shiftKey){
    ctx.setState({sqActive: false, sqActive_UI:false});
    ctx.setState({globalOnSqClass: ''});
  }
}

updateGlobalSq(){
  const ctx = this;
  const {globalsq,globalChannels, storedGlobals,sqActive_UI,
         sqActive,helperindex,global_helperindex} = ctx.state;

  var gbchan = globalChannels.split(" ");
  var gbdur = globalsq.split(" ");

  if(gbdur.length >= helperindex)
    ctx.setState({sqActive:false});

  if(Object.values(storedGlobals).length >= helperindex)
    ctx.setState({global_helperindex:0});


    console.log(Object.values(storedGlobals).length);
    console.log(global_helperindex);

  if(sqActive_UI === true){
    console.log('here');
    if(sqActive === false){

      ctx.setState({helperindex:0});
      var compileDuration = gbdur[helperindex] * 1000;
      var selGlobalPair = global_helperindex ;
      setTimeout(() => ctx.sequenceGlobals(selGlobalPair),compileDuration);
      ctx.setState({sqActive :true});
    }
    else if (sqActive === true){
      var k = helperindex+1;
      var gk = global_helperindex+1;
      ctx.setState({helperindex:k, global_helperindex:gk});
      var compileDuration = gbdur[helperindex] * 1000;
      var selGlobalPair = _.random(Object.values(storedGlobals).length-1);
      // if(gk < Object.values(storedGlobals).length){
      //   selGlobalPair = gk;
      // }
      // setTimeout(() => ctx.sequenceGlobals(k),compileDuration);
      setTimeout(() => ctx.sequenceGlobals(selGlobalPair),compileDuration);
    }
  }
}

sequenceGlobals = (selected_global_index) => {
  const ctx = this;
  
  const {tidalServerLink,globalOnClickClass, storedGlobals,pressed} = ctx.state;
  const channels = ctx.props.channel;
  const storedPatterns = ctx.props.globalparams.storedPatterns;
  
  for (var i = 0; i < storedPatterns.length; i++) {
  if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
    var pr =pressed;
    for(var sp = 0; sp < pr.length; sp++){
      if(selected_global_index === sp){
        pr[sp] = true;
      }
      else {
        pr[sp] = false;
      }
    }
    
    var patternbody = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
    var patname = storedPatterns[i].substring(0,_.indexOf(storedPatterns[i], "$")+1 );
    var tr,cm,slc;
    if (storedGlobals[selected_global_index].transform === undefined)
      tr = '';
    else
      tr = storedGlobals[selected_global_index].transform;

    if (storedGlobals[selected_global_index].command === undefined)
      cm = '';
    else
      cm = storedGlobals[selected_global_index].command;

    if (storedGlobals[selected_global_index].selectedChannels=== undefined)
      slc = '';
    else
      slc = storedGlobals[selected_global_index].selectedChannels;


    var pattern = patname + tr + patternbody +cm;

    console.log(pattern);

    ctx.consoleSubmit(tidalServerLink, pattern);
    ctx.setState({globalCommands: cm,
                  globalTransformations: tr,
                  globalChannels:slc ,
                  pressed: pr});

    }
  }
 ctx.updateGlobalSq();
}
updatePatterns(tidalServerLink,storedPatterns,globalTransformations,
                globalCommands,channels) {

  const ctx = this;
  const { globalChannels} = ctx.state;
  var tempAr = [] ;
  var gbchan = globalChannels.split(" ");
  console.log("CHANNELS" + gbchan[1]);

  if (gbchan === undefined ||gbchan[0] === undefined || gbchan[0] === ' ' || gbchan[0] ==='0' ){
    for (var i = 0; i < storedPatterns.length; i++) {
        if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
          var patternbody = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
          var patname = storedPatterns[i].substring(0,_.indexOf(storedPatterns[i], "$")+1 );
          tempAr[i] = patname + globalTransformations + patternbody + globalCommands;
          ctx.consoleSubmit(tidalServerLink, tempAr[i]);

        }
      }
    }
  else {
  _.forEach( gbchan, function(chan, j){
      var i = parseInt(chan) - 1;
      if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
        var patternbody = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
        var patname = storedPatterns[i].substring(0,_.indexOf(storedPatterns[i], "$")+1 );
        tempAr[i] = patname + globalTransformations + patternbody + globalCommands;
        ctx.consoleSubmit(tidalServerLink, tempAr[i]);
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
  const { click, channel } = ctx.props;
  const { scPattern, csize, activeMatrix, storedPatterns,
          pressed, storedGlobals, globalTransformations, globalCommands,
          globalChannels,c_type, c_name, c_step,
           c_transition,globalOnClickClass, globalsq } = ctx.state

  const updateScPattern = event  => {
    ctx.setState({scPattern: event.target.value})
  }
  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  const maskedInputPatterns = "1 " + _.repeat("1  ", storedPatterns.length-1);
  const maskedInputDurations=  _.repeat("1.1  ", 4);
  var historyOptions = {
      mode: '_rule',
      theme: '_style',
      fixedGutter: true,
      scroll: false,
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
            {this.state.sceneSentinel && <button onClick={ctx.addItem.bind(ctx)}>Update Scene</button>}
            {!this.state.sceneSentinel && <button onClick={ctx.addItem.bind(ctx)}>Add Scene</button>}
            <button onClick={ctx.clearMatrix.bind(ctx)}>Clear Grid</button>
          </div>
          <div className={'sceneList'} style={{ width: '100%'}}>
            <ul style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '0', margin: '0'}}>
              {this.props.user.user.name && ctx.renderScenes(items)}
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
        <Layout layoutHeight={150}>
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
              > Globals &nbsp;&nbsp;
              <input mask={maskedInputDurations} className={"sqdiv" + ctx.state.globalOnSqClass}
                key={'globalsq'}
                onKeyUp = {ctx.handleGlobalsq.bind(ctx)}
                onChange={ctx.handleGlobalsqDuration.bind(ctx)}
                value = {globalsq}
                placeholder="Global Sequencer "/>
              <MaskedInput mask={maskedInputPatterns} className={"newChannelInput" + ctx.state.globalOnClickClass}
                key={'globalchannel'}
                onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)}
                onChange={ctx.handleGlobalChannels.bind(ctx)}
                value = {globalChannels}
                placeholder="Channels "/>
              <input className={"defaultArea" + ctx.state.globalOnClickClass} key={'globaltransform'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalTransformations.bind(ctx)} value = {globalTransformations} placeholder="Global Transformation "/>
              <input className={"defaultArea" + ctx.state.globalOnClickClass} key={'globalcommand'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalCommands.bind(ctx)} value = {globalCommands} placeholder="Global Command " />
              {_.map(storedGlobals, (c, i) => {
                 return <Button id={i} pressed = {pressed[i]} onClick={ctx.clicked.bind(ctx)}   theme = {themeButton} activeStyle={{position:'relative', top: 1}} >{i}</Button>
               })}
               <Button theme = {themeButton}  onClick={ctx.record.bind(ctx)} activeStyle={{position:'relative', top: 2}} >Rec</Button>
            </div>
          </Layout>
          <LayoutSplitter />
          <Layout layoutWidth={'flex'}>
            <div id="Execution" style={{width: '100%', flexDirection: 'column'}}>
              <p>> Console</p>
              <textarea className={"defaultPatternArea" + ctx.state.tidalOnClickClass} key={'tidalsubmit'} onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder="Tidal (Ctrl + Enter)"/>
              <textarea className={"defaultPatternArea" + ctx.state.SCOnClickClass} key={'scsubmit'} onKeyUp={ctx.handleSubmit.bind(ctx)} onChange={updateScPattern} value={scPattern}  placeholder={'SuperCollider (Ctrl + Enter) '} />
            </div>
          </Layout>
        </Layout>
      </Layout>
      <LayoutSplitter />
      <Layout layoutWidth={400}>
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
