import React, { Component } from 'react';
import { connect } from 'react-redux';
import './style/Layout.css';
import './style/Dropdown.css';
import './style/Home.css';
import './style/Menu.css';
import './style/ContextMenu.css';
import io from 'socket.io-client';

import {sendScPattern, sendSCMatrix,
      sendGlobals,consoleSubmitHistory, consoleSubmit, fbcreateMatrix,
      fbdelete, fborder, updateMatrix,globalUpdate,
      startClick,stopClick,globalStore,fbupdateglobalsinscene,
      fbcreatechannelinscene, fbupdatechannelinscene, selectCell,
      createChannel, deleteChannel, createCell, bootCells,
      updateLayout, forceUpdateLayout, fbupdatelayout, fbsavelayout} from '../actions'

import Patterns from './Patterns.react';
import Channels from './Channels.react';
import Settings from './Settings.react';
import Firebase from 'firebase';
import store from '../store';
import _ from 'lodash';

import { SubMenu, ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { SelectableGroup } from 'react-selectable';
import Dropdown from 'react-dropdown'

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/dialog/dialog.css';
import '../assets/_style.css';
import '../assets/_rule.js';

// Grid Layout
var WidthProvider = require('react-grid-layout').WidthProvider;
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

var keymaster = require('keymaster');
var MaskedInput = require('react-maskedinput')

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
      csize: 1,
      manual_layout_trig: true,
      default_layout: [{i: "scenes", x: 0, y: 0, w: 3, h: 20, minW: 3, isVisible: true},
                       {i: 'matrix', x: 3, y: 0, w: 13, h: 13, minW: 5, isVisible: true},
                       {i: 'patterns', x: 16, y: 0, w: 8, h: 20, minW: 3, isVisible: true},
                       {i: 'pattern_history', x: 3, y: 13, w: 13, h: 3, minW: 3, isVisible: true},
                       {i: 'channel_add', x: 3, y: 16, w: 3, h: 4, minW: 2, isVisible: true},
                       {i: 'globals', x: 6, y: 16, w: 5, h: 4, minW: 4, isVisible: true},
                       {i: 'console', x: 11, y: 16, w: 5, h: 4, minW: 2, isVisible: true},
                       {i: 'setting', x: 0, y: 21, w: 7, h: 13, minW: 7, isVisible: true}]
    }

    // store.dispatch(updateLayout(this.state.default_layout))
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

  keymaster('shift+r', ctx.resetLayout.bind(ctx));
  keymaster('shift+f', ctx.makeMatrixFullscreen.bind(ctx));

  keymaster('shift+1', ctx.onLoadCustomLayout.bind(ctx, 'c_1'));
  keymaster('shift+2', ctx.onLoadCustomLayout.bind(ctx, 'c_2'));
  keymaster('shift+3', ctx.onLoadCustomLayout.bind(ctx, 'c_3'));
  keymaster('shift+4', ctx.onLoadCustomLayout.bind(ctx, 'c_4'));
}

componentWillUnmount(props, state) {
  const ctx = this;
  keymaster.unbind('shift+r', ctx.resetLayout.bind(ctx));
  keymaster.unbind('shift+f', ctx.makeMatrixFullscreen.bind(ctx));

  keymaster.unbind('shift+1', ctx.onLoadCustomLayout.bind(ctx, 'c_1'));
  keymaster.unbind('shift+2', ctx.onLoadCustomLayout.bind(ctx, 'c_2'));
  keymaster.unbind('shift+3', ctx.onLoadCustomLayout.bind(ctx, 'c_3'));
  keymaster.unbind('shift+4', ctx.onLoadCustomLayout.bind(ctx, 'c_4'));
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
  const {csize} = ctx.state;

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
  const {scPattern, tidalServerLink }=ctx.state;
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
  const {tidalServerLink} = ctx.state;
  const storedPatterns = ctx.props.globalparams.storedPatterns;
  const channels = ctx.props.channel;
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.setState({tidalOnClickClass: ' Executed'});
    setTimeout(function(){ ctx.setState({tidalOnClickClass: ' '}); }, 500);
    ctx.consoleSubmitHistory(tidalServerLink, body,storedPatterns,channels);
  }
}


////////////////////////////// HANDLERS ////////////////////////////
updateMatrix(item) {
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
  const { activeMatrix, c_type, c_name, c_step, c_transition } = ctx.state;
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
          const newCell = {cstep: c_step, cid: _index };
          store.dispatch(createCell(newCell));
          ctx.setState({ activeMatrix: d.matName, matName: d.matName });
        }

      } else {
        console.log('"' + c_name + '" already exists in "' + d.matName + '"');
      }
    }
  })
}

handleChannelName = event => {
  this.setState({c_name: event.target.value});
}

handleChannelType = (option) => {
  this.setState( {c_type: option.label} );
}

handleChannelStep = event => {
  this.setState({c_step: event.target.value});
}
handleChannelTransition = event => {
  this.setState({c_transition: event.target.value});
}

handleSelection (selectedKeys) {
  store.dispatch(selectCell(selectedKeys));
}

handleUnselection() {
  store.dispatch(selectCell([]))
}

renderChannel(item){
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

  return <Channels active={activeMatrix}
            scene_key={scene_key}
            item={item}/>
}

renderPlayer() {
  const ctx = this;
  var items = ctx.props.channel;

  return (<div className={"AllChannels draggableCancel"}>
          {_.map(items, ctx.renderChannel.bind(ctx))}
          </div>)
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

  const { matName, storedGlobals } = ctx.state;
  const { uid } =ctx.props.user.user;
  const items =ctx.props[ctx.state.modelName.toLowerCase()];
  // const propstoredGlobals = ctx.props.globalparams.storedGlobals;

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
  const { activeMatrix } = ctx.state;
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
    _.forEach(item.channels, function(ch, i){
      const c_cell = { propedcell: ch.vals, cid: ch.cid ,c_key: ch.key, cstep: ch.step};
      store.dispatch(bootCells(c_cell));
    });
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

  const className = activeMatrix === item.matName ? "SceneItem-active" : "SceneItem";
  return item.key && (
    <div key={item.key} className={className+ " draggableCancel"}>
      <div>
        <button onClick={handleDelete}>{'X'}</button>
        <button onClick={updateMatrix}>{item.matName}</button>
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

  var pr = pressed;
  for(var sp = 0; sp < pr.length; sp++){
    if(parseInt(event.target.id, 10) === sp){
      pr[sp] = true;
    }
    else {
      pr[sp] = false;
    }
  }
  ctx.setState({ pressed: pr });

  var matkey;
  _.each(scenes , function (sc, i) {
    if(sc.key === sceneIndex){
      ctx.setState({storedGlobals: sc.storedGlobals})
      matkey = sc.key;
    }
  })

  var ttm;
  if (event.shiftKey) {
    ttm = storedGlobals;
    ttm[event.target.id] = {transform:'', command:'', selectedChannels:''};

    fbupdateglobalsinscene('Matrices', ttm, matkey);
    store.dispatch(globalUpdate('', '', ''));
    ctx.setState({globalTransformations: '', globalCommands: '', globalChannels: ''})
  }
  else if (event.altKey) {
    ttm = storedGlobals;
    ttm[event.target.id] = {transform:globalTransformations,
              command:globalCommands,
              selectedChannels:globalChannels};
    fbupdateglobalsinscene('Matrices', ttm, matkey);
    store.dispatch(globalStore(ttm, globalparams.storedPatterns));
    store.dispatch(globalUpdate(globalTransformations, globalCommands, globalChannels));
    ctx.setState({storedGlobals: ttm});
  }
  else {
    ttm = storedGlobals[event.target.id];
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



  // var key;
  // _.each(ctx.props.matrices, function(m, i){
  //   if(i === sceneIndex){
  //     key = m;
  //     //tss = m.globalparams;
  //   }
  // })
  fbupdateglobalsinscene('Matrices', ns, sceneIndex);
  store.dispatch(globalStore(ns, storedPatterns));
  ctx.setState({storedGlobals: ns, pressed: pr})

}

handleUpdatePatterns = event => {
  // const body = event.target.value;
  const ctx = this;
  const {tidalServerLink,globalCommands,
        globalTransformations} = ctx.state;
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

  var temp = body;
  ctx.setState({globalTransformations:temp});
}


handleGlobalChannels = event => {
  const body=event.target.value
  const ctx=this;

  ctx.setState({globalChannels:body});
}

handleGlobalCommands = event => {
  const body=event.target.value;
  const ctx=this;

  var temp = body;
  ctx.setState({globalCommands:temp});
}

sendGlobals(tidalServerLink,storedPatterns,storedGlobals, vals,channels){

  store.dispatch(sendGlobals(tidalServerLink,storedPatterns,storedGlobals,
                            vals,channels));
}
handleGlobalsqDuration = event => {
  const body=event.target.value
  const ctx=this;

  ctx.setState({globalsq:body});
}
handleGlobalsq = event => {
  const ctx = this;

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
  const {globalsq,storedGlobals,sqActive_UI,
         sqActive,helperindex,global_helperindex} = ctx.state;

  // var gbchan = globalChannels.split(" ");
  var gbdur = globalsq.split(" ");

  if(gbdur.length >= helperindex)
    ctx.setState({sqActive:false});

  if(Object.values(storedGlobals).length >= helperindex)
    ctx.setState({global_helperindex:0});

  var compileDuration, selGlobalPair;
  if(sqActive_UI === true){
    if(sqActive === false){
      ctx.setState({helperindex:0});
      compileDuration = gbdur[helperindex] * 1000;
      selGlobalPair = global_helperindex ;
      setTimeout(() => ctx.sequenceGlobals(selGlobalPair),compileDuration);
      ctx.setState({sqActive :true});
    }
    else if (sqActive === true){
      var k = helperindex+1;
      var gk = global_helperindex+1;
      ctx.setState({helperindex:k, global_helperindex:gk});
      compileDuration = gbdur[helperindex] * 1000;
      selGlobalPair = _.random(Object.values(storedGlobals).length-1);
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
  const {tidalServerLink, storedGlobals, pressed} = ctx.state;
  const storedPatterns = ctx.props.globalparams.storedPatterns;

  for (var i = 0; i < storedPatterns.length; i++) {
  if(storedPatterns[i] !== undefined && storedPatterns[i] !== ''){
    var pr = pressed;
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
      var i = parseInt(chan, 10) - 1;
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

handleClick = (e, data) => {
  console.log(e, data);
}

saveLayouttoCustom = (id, e, data) => {
  fbsavelayout("Accounts", this.props.layout.windows, this.props.user.user.uid, data.item);
}

onAddlayoutItem(specifier){
  var layouts = this.props.layout.windows;
  store.dispatch(forceUpdateLayout(_.concat(layouts, _.find(this.state.default_layout, ['i', specifier])), layouts.length));
}
onRemovelayoutItem(specifier){
  var layouts = this.props.layout.windows;
  if(layouts !== undefined) {
    _.forEach(layouts, function(item, i) {
      if (item.i === specifier) {
        layouts[i].isVisible = false;
      }
    });
    fbupdatelayout("Accounts", layouts, this.props.user.user.uid);
    store.dispatch(forceUpdateLayout(layouts, layouts.length));
  }
}
onLayoutChange(layout) {
  const ctx = this;
  var temp_layouts = []
  _.forEach(layout, function(l) {
    const propItem = _.find(ctx.props.layout.windows, ['i', l.i]);
    l.isVisible = propItem.isVisible;
    if(l.isVisible === undefined)
      l.isVisible = true;

    if (ctx.state.manual_layout_trig){
      l.x = propItem.x;
      l.y = propItem.y;
      l.w = propItem.w;
      l.h = propItem.h;
      l.minW = propItem.minW;
    }
    temp_layouts = _.concat(temp_layouts, _.omitBy(l, _.isUndefined));
  })

  ctx.setState({manual_layout_trig: false});
  fbupdatelayout("Accounts", temp_layouts, ctx.props.user.user.uid);
  store.dispatch(updateLayout(temp_layouts));
}

onLoadCustomLayout(layout_id) {
  const layout = Object.values(this.props.user.user.layouts.customs[[layout_id]]);
  this.setState({manual_layout_trig: true});
  if (layout !== undefined) {
    store.dispatch(forceUpdateLayout(layout, this.props.layout.windows.length));
  }
}

makeMatrixFullscreen() {
  this.setState({manual_layout_trig: true});
  var layouts = this.props.layout.windows
  if(layouts !== undefined) {
    var found = false;
    _.forEach(layouts, function(item, i) {
      if (item.i === 'matrix') {
        layouts[i].y = 0;
        layouts[i].x = 0;
        layouts[i].w = 24;
        layouts[i].h = 20;
        layouts[i].isVisible = true;
        found = true;
      }
      else {
        layouts[i].isVisible = false;
      }
    });

    if (!found) {
      layouts = _.concat(layouts, {i: 'matrix', x: 0, y: 0, w: 24, h: 20, minW: 5, isVisible: true});
    }

    store.dispatch(forceUpdateLayout(layouts, layouts.length));
  }
}

resetLayout() {
  this.setState({manual_layout_trig: true});
  store.dispatch(forceUpdateLayout(this.state.default_layout, this.props.layout.windows.length));
}

renderLayouts(layoutItem, k) {
  const ctx = this;

  const { scPattern, activeMatrix, storedPatterns,
          pressed, storedGlobals, globalTransformations, globalCommands,
          globalChannels,c_type, c_name, c_step,
          c_transition,globalsq } = ctx.state

  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  const historyOptions = {
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
  const maskedInputDurations=  _.repeat("1.1  ", 4);
  const maskedInputPatterns = "1 " + _.repeat("1  ", storedPatterns.length-1);
  const updateScPattern = event  => {
    ctx.setState({scPattern: event.target.value})
  }
  const getGridParameters = (specifier) => {
    const itemToCopy = _.find(ctx.props.layout.windows, ['i', specifier]);
    var newGridParameters = {x: 0, y:100, h:1, w:1, minW:0, isVisible: false};
    if(itemToCopy){
      newGridParameters.x = itemToCopy.x;
      newGridParameters.y = itemToCopy.y;
      newGridParameters.w = itemToCopy.w;
      newGridParameters.h = itemToCopy.h;
      newGridParameters.minW = itemToCopy.minW;
      newGridParameters.isVisible = itemToCopy.isVisible;
    }
    return newGridParameters;
  }

  if (layoutItem.i === 'matrix') {
    return layoutItem.isVisible && (<div key={'matrix'} data-grid={getGridParameters('matrix')} >
      <div className={"PanelHeader"}> ■ {'"'+activeMatrix+'"'}
        <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "matrix")}>X</span>
      </div>
      <SelectableGroup
        onSelection={ctx.handleSelection.bind(ctx)}
        onNonItemClick={ctx.handleUnselection.bind(ctx)}
        tolerance={5}>
        {ctx.renderPlayer()}
      </SelectableGroup>
    </div>);
  }
  else if (layoutItem.i === 'scenes') {
    return layoutItem.isVisible && (<div key={"scenes"} data-grid={getGridParameters('scenes')}>
      <div>
        <div className={"PanelHeader"}> ■ All Scenes
          <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "scenes")}>X</span>
        </div>
        <div>
          <input className={'Input draggableCancel'} placeholder={'New Scene Name'} value={ctx.state.matName} onChange={ctx.changeName.bind(ctx)}/>
          <div style={{display: 'inline-flex', justifyContent: 'space-between'}}>
            {ctx.state.sceneSentinel && <button className={'Button draggableCancel'} onClick={ctx.addItem.bind(ctx)}>Update Scene</button>}
            {!ctx.state.sceneSentinel && <button className={'Button draggableCancel'} onClick={ctx.addItem.bind(ctx)}>Add New Scene</button>}
            <button className={'Button draggableCancel'} onClick={ctx.clearMatrix.bind(ctx)}>Clear Grid</button>
          </div>
        </div>
        <div className={'AllScenes'}>
          <div>
            {ctx.props.user.user.name && ctx.renderScenes(items)}
            {!ctx.props.user.user.name && <div style={{ color: 'rgba(255,255,102,0.75)'}}>Please login to see saved scenes.</div>}
          </div>
        </div>
      </div>
    </div>);
  }
  else if (layoutItem.i === 'patterns') {
    return layoutItem.isVisible && (<div key={'patterns'} data-grid={getGridParameters('patterns')}>
      <div className={"PanelHeader"}> ■ Patterns in <span style={{fontWeight: 'bold'}}>{'"'+activeMatrix+'"'}</span>
        <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "patterns")}>X</span>
      </div>
      <div className={"AllPatterns"} >
        <Patterns active={activeMatrix}/>
      </div>
    </div>);
  }
  else if (layoutItem.i === 'pattern_history') {
    return layoutItem.isVisible && (<div key={'pattern_history'} data-grid={getGridParameters('pattern_history')}>
      <div className={"PanelHeader"}> ■ Pattern History
        <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "pattern_history")}>X</span>
      </div>
      <div>
       {_.map(storedPatterns, (c, i) => {
          return <CodeMirror key={i} className={'defaultPatternHistoryArea'} onKeyUp={null} name={"defaultPatternArea"} value={storedPatterns[i]} options={historyOptions}/>
        })}
      </div>
    </div>);
  }
  else if (layoutItem.i === 'channel_add') {
    return layoutItem.isVisible && (<div key={'channel_add'} data-grid={getGridParameters('channel_add')}>
      <div className={"PanelHeader"}> ■ Add Channel
        <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "channel_add")}>X</span>
      </div>
      <div>
        <Dropdown className={"draggableCancel"} options={channelOptions} onChange={ctx.handleChannelType.bind(ctx)} value={c_type} placeholder="Type" />
        <input className={"Input draggableCancel"} onChange={ctx.handleChannelName.bind(ctx)} value={c_name} placeholder="Name "/>
        <input className={"Input draggableCancel"} onChange={ctx.handleChannelStep.bind(ctx)} value={c_step} placeholder="Step "/>
        <input className={"Input draggableCancel"} onChange={ctx.handleChannelTransition.bind(ctx)} value={c_transition} placeholder="Transition (optional)"/>
        <button className={"Button draggableCancel"} onClick={ctx.addChannel.bind(ctx)}>Add</button>
      </div>
    </div>);
  }
  else if (layoutItem.i === 'globals') {
    return (<div key={'globals'} data-grid={getGridParameters('globals')}>
      <div className={"PanelHeader"}> ■ Global Parameters
        <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "globals")}>X</span>
      </div>
      <div>
        <input mask={maskedInputDurations}
          className={"Input" + ctx.state.globalOnSqClass + " draggableCancel"}
          key={'globalsq'}
          onKeyUp={ctx.handleGlobalsq.bind(ctx)}
          onChange={ctx.handleGlobalsqDuration.bind(ctx)}
          value={globalsq}
          placeholder="Global Sequencer "/>
        <MaskedInput mask={maskedInputPatterns}
        className={"Input" + ctx.state.globalOnClickClass + " draggableCancel"}
          key={'globalchannel'}
          onKeyUp={ctx.handleUpdatePatterns.bind(ctx)}
          onChange={ctx.handleGlobalChannels.bind(ctx)}
          value={globalChannels}
          placeholder="Channels "/>
        <input className={"Input" + ctx.state.globalOnClickClass + " draggableCancel"} key={'globaltransform'} onKeyUp={ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalTransformations.bind(ctx)} value={globalTransformations} placeholder="Global Transformation "/>
        <input className={"Input" + ctx.state.globalOnClickClass + " draggableCancel"} key={'globalcommand'} onKeyUp={ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalCommands.bind(ctx)} value={globalCommands} placeholder="Global Command " />
        {_.map(storedGlobals, (c, i) => {
           return <button className={"Button " + pressed[i] + " draggableCancel"} key={i} onClick={ctx.clicked.bind(ctx)}>{i}</button>
         })}
         <button className={"Button draggableCancel"} onClick={ctx.record.bind(ctx)}>Rec</button>
      </div>
    </div>);
  }
  else if (layoutItem.i === 'console') {
    return layoutItem.isVisible && (<div key={'console'} data-grid={getGridParameters('console')}>
      <div className={"PanelHeader"}> ■ Console
        <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "console")}>X</span>
      </div>
      <div>
        <textarea className={"ConsoleTextBox" + ctx.state.tidalOnClickClass + " draggableCancel"} key={'tidalsubmit'} onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder="Tidal (Ctrl + Enter)"/>
        <textarea className={"ConsoleTextBox" + ctx.state.SCOnClickClass + " draggableCancel"} key={'scsubmit'} onKeyUp={ctx.handleSubmit.bind(ctx)} onChange={updateScPattern} value={scPattern}  placeholder={'SuperCollider (Ctrl + Enter) '} />
      </div>
    </div>);
  }
  else if (layoutItem.i === 'setting') {
    return layoutItem.isVisible && (<div key={'setting'} data-grid={getGridParameters('setting')}>
      <div className={"PanelHeader"}> ■ Config Settings
        <span className={"PanelClose draggableCancel"} onClick={ctx.onRemovelayoutItem.bind(ctx, "setting")}>X</span>
      </div>
      <Settings uid={ctx.props.user.user.uid}/>
    </div>);
  }
  else {
    return layoutItem.isVisible && (<div key={layoutItem.i} data-grid={getGridParameters(layoutItem.i)}>
      </div>)
  }
}

render() {
  const ctx=this;

  // Layout height params for fullscreen
  var vertical_n = 20,
      h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 62, // the menubar height
      margin = 7,
      row_height = (h-(vertical_n+1)*margin)/vertical_n;

  let layouts = _.filter(ctx.props.layout.windows, ['isVisible', true, 'i', 'dummy']);
  return <div>
  <ContextMenuTrigger id="global_context" holdToDisplay={-1}>
    <div className={"Home cont"}>
      <ResponsiveReactGridLayout
          className={"layout"}
          layout={layouts}
          breakpoints={{lg: 1200, md: 996, sm: 768, xs: 360}}
          cols={{lg: 24, md: 20, sm: 12, xs: 8}}
          draggableCancel={'.draggableCancel'}
          margin={[margin, margin]}
          rowHeight={row_height}
          onLayoutChange={ctx.onLayoutChange.bind(ctx)}
          verticalCompact={true}
        >
        {_.map(layouts, ctx.renderLayouts.bind(ctx))}
      </ResponsiveReactGridLayout>
    </div>
  </ContextMenuTrigger>

  <ContextMenu id="global_context" className={"draggableCancel"}>
    <MenuItem data={{value: 1}} onClick={ctx.handleClick.bind(ctx)}>
      Does nothing
    </MenuItem>
    <MenuItem divider />
    <SubMenu title={'Windows'}>
      {_.map(ctx.state.default_layout, function(layoutItem, key) {
        if(_.find(layouts, { 'i': layoutItem.i, 'isVisible': true }) )
          return <MenuItem key={key} onClick={ctx.onRemovelayoutItem.bind(ctx, layoutItem.i)} data={{ item: layoutItem.i }}>{layoutItem.i}<span style={{float: 'right'}}>√</span></MenuItem>;
        else
          return <MenuItem key={key} onClick={ctx.onAddlayoutItem.bind(ctx, layoutItem.i)} data={{ item: layoutItem.i }}>{layoutItem.i}</MenuItem>;
      })}
    </SubMenu>
    <SubMenu title={'Layouts'}>
      <MenuItem onClick={ctx.resetLayout.bind(ctx)} data={{ item: 'reset' }}>Reset<span style={{float: 'right'}}>⇧ + R</span></MenuItem>
      <MenuItem onClick={ctx.makeMatrixFullscreen.bind(ctx)} data={{ item: 'reset' }}>Max. Grid<span style={{float: 'right'}}>⇧ + F</span></MenuItem>
      <MenuItem divider />
      {_.map({a:1, b:2, c:3, d:4}, function(i, key) {
        if(ctx.props.user.user.layouts !== undefined && ctx.props.user.user.layouts.customs !== undefined) {
          if(ctx.props.user.user.layouts.customs[["c_"+i]] !== undefined)
            return <MenuItem key={key} onClick={ctx.onLoadCustomLayout.bind(ctx, "c_"+i)} data={{ item: 'c_'+i }}>Cust. {i}<span style={{float: 'right'}}>⇧ + {i}</span></MenuItem>
          else
            return <MenuItem key={key} onClick={ctx.saveLayouttoCustom.bind(ctx, "c_"+i)} data={{ item: 'c_'+i }}>click to save here</MenuItem>
        }
        else
          return <MenuItem key={key} onClick={ctx.saveLayouttoCustom.bind(ctx, "c_"+i)} data={{ item: 'c_'+i }}>click to save here</MenuItem>
      })}
    </SubMenu>
  </ContextMenu>

  </div>
  }
}

export default connect(state => state)(Home);
