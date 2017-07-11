import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';
import './Menu.css';
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
var MaskedInput = require('react-maskedinput')
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
      sceneIndex: '',
      parvalues: '',
      globalCommands: '',
      globalTransformations: '',
      globalChannels: '',
      username: '',
      storedPatterns: [],
      storedGlobals: [{transform:'', command: '', selectedChannels: ''}],
      tidalOnClickClass: ' ',
      SCOnClickClass: ' ',
      globalOnClickClass: ' ',
      pressed : false,
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

renderScene(item, dbKey, i) {
  const ctx = this;
  const { activeMatrix, transition, storedGlobals } = ctx.state;
  const { patterns } = ctx.props;

  var sglobals = [];
  _.forEach(item.storedGlobals, function(d, i){
    sglobals.push(d);
  });

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

toggleCanvas(){
  const ctx = this;
  ctx.setState({isCanvasOn: !ctx.state.isCanvasOn});
}

clicked = event => {
  const ctx=this;
  const {activeMatrix,pressed,storedGlobals,storedPatterns, globalChannels,
        globalCommands,globalTransformations,sceneIndex} =ctx.state;
  var ns,tempgb, tempgbtwo, tempchan;
  var temp ={globalTransformations:'', globalCommands: '', globalChannels:''};

  const scenes = ctx.props.matrices;
  var matkey;
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
    store.dispatch(globalStore(ttm,storedPatterns));
    store.dispatch(globalUpdate(globalTransformations, globalCommands, globalChannels));
    ctx.setState({storedGlobals:ttm});

  }
  else {
    var ttm = storedGlobals[event.target.id];
    store.dispatch(globalStore(ttm,storedPatterns));
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
    ns.push(temp);
  }
  var key;
  _.each(ctx.props.matrices, function(m, i){
    if(i === sceneIndex){
      key = m;
    }
  })
  fbupdateglobalsinscene('Matrices',ns,key.key);
  store.dispatch(globalStore(ns,storedPatterns));
  ctx.setState({storedGlobals:ns})
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
        tempAr[i] = storedPatterns[i].substring(_.indexOf(storedPatterns[i], "$")+1);
        _.each(channels, function (ch, k) {
          var b = storedPatterns[i][0]+storedPatterns[i][1];
          if(ch.name=== b){
            tempAr[i] = ch.name + '$' + globalTransformations + tempAr[i] + globalCommands;
            ctx.consoleSubmit(tidalServerLink, tempAr[i]);
          }
        })
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
           c_transition,globalOnClickClass } = ctx.state

  const updateScPattern = event  => {
    ctx.setState({scPattern: event.target.value})
  }
  const items = ctx.props[ctx.state.modelName.toLowerCase()];

  var activeChannels = []
  _.each(Object.values(channel), function (d, i) {
    if (d.scene === activeMatrix)
      activeChannels = _.concat(activeChannels, d)
  });
  console.log(activeChannels);
  console.log(activeChannels.length);
  const maskedInputPatterns = "(1) | " + _.repeat("1  ", activeChannels.length);
  console.log(maskedInputPatterns);

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
              <p>> Globals</p>
              <MaskedInput mask={maskedInputPatterns} className={"newChannelInput" + ctx.state.globalOnClickClass}
                key={'globalchannel'}
                onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)}
                onChange={ctx.handleGlobalChannels.bind(ctx)}
                value = {globalChannels}
                placeholder="Channels "/>
              <input className={"defaultPatternHistoryArea" + ctx.state.globalOnClickClass} key={'globaltransform'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalTransformations.bind(ctx)} value = {globalTransformations} placeholder="Global Transformation "/>
              <input className={"defaultPatternHistoryArea" + ctx.state.globalOnClickClass} key={'globalcommand'} onKeyUp = {ctx.handleUpdatePatterns.bind(ctx)} onChange={ctx.handleGlobalCommands.bind(ctx)} value = {globalCommands} placeholder="Global Command " />
              {_.map(storedGlobals, (c, i) => {
                 return <Button id={i} onClick={ctx.clicked.bind(ctx)}   theme = {themeButton} activeStyle={{position:'relative', top: 1}} >{i}</Button>
               })}
               <Button theme = {themeButton}  onClick={ctx.record.bind(ctx)} activeStyle={{position:'relative', top: 2}} >Rec< /Button>
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
