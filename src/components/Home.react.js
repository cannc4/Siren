import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

import { initMyTidal,sendScPattern, sendSCMatrix, sendPatterns,createTimer,timerThread,
      startTimer, pauseTimer, stopTimer,updateTimerduration,startIndividualTimer,stopIndividualTimer,pauseIndividualTimer,
      consoleSubmit, fbcreateMatrix, fbdelete,fborder, fetchModel, updateMatrix,assignTimer,
      startClick,stopClick, changeUsername} from '../actions'
import {Layout, LayoutSplitter} from 'react-flex-layout';
import Simple from './Simple.react'
import Patterns from './Patterns.react';
import Firebase from 'firebase';
import store from '../store';
import _ from 'lodash';

// import CodeMirror from 'react-codemirror';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/base16-light.css';
// import 'codemirror/mode/elm/elm';

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

class Home extends Component {
  constructor(props) {
    super(props);
    this.state={
      matName: "",
      modelName : "Matrices",
      tidalServerLink: 'localhost:3001',
      steps: 12,
      channels: ['1','2','3', '4', '5', 'cps'],
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
      globalFunctions: '',
      username: 'vou'
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
componentWillMount(props,state){
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
  // if(props.user !== undefined){
    var runNo = [];
    const ctx=this;
    const { patterns, timer, click}=props;
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
          const vals = values[runNo[i]][i];
          const channel = channels[i];
          const obj = {[channel]: vals};
          if (vals !== undefined) {
            var scenePatterns = [];
            const items = this.props[this.state.modelName.toLowerCase()]
            _.each(items, function(d){
              if(d.matName === activeMatrix)
              scenePatterns = d.patterns;
            })

            ctx.sendPatterns(tidalServerLink, obj , scenePatterns,solo, transition, channels,timer.timer[i]);
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
  var patterns = [];

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
        patterns = d.patterns;
      }
    })

    const nextObj = Object.values(items)[(i_save+1)%Object.values(items).length];
    updateMatrix(patterns, values, nextObj);
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

sendPatterns(tidalServerLink, vals, channelcommands, patterns,solo,transition, channels) {
  const ctx = this;
  const {globalCommands,globalFunctions} = ctx.state;
  store.dispatch(sendPatterns(tidalServerLink, vals, channelcommands, patterns,solo, transition, channels,globalFunctions,globalCommands));
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

handleSubmit = event => {
  const body=event.target.value
  const ctx=this;
  const {scPattern, tidalServerLink }=ctx.state;
  if(event.keyCode === 13 && event.ctrlKey && body){
    ctx.sendScPattern(tidalServerLink, scPattern);
  }
}
handleGlobalFunctions = event => {
  const body=event.target.value
  const ctx=this;
  const {globalFunctions}=ctx.state;
  var temp = body;
  ctx.setState({globalFunctions:temp});
}

handleGlobalCommands = event => {
  const body=event.target.value
  const ctx=this;
  const {globalCommands}=ctx.state;
  var temp = body;
  ctx.setState({globalCommands:temp});
}

handleConsoleSubmit = event => {
  const value = event.target.value;
  const ctx = this;
  const {tidalServerLink} = ctx.state;

  if(event.keyCode === 13 && event.ctrlKey && value){
    ctx.consoleSubmit(tidalServerLink, value);
  }
}

updateMatrix(patterns, values, item) {

  // DEBUG
  const items = this.props[this.state.modelName.toLowerCase()]
  console.log('SCENES: ');
  _.forEach(Object.values(items), function(d){
    console.log(d.matName + ' ' + d.sceneIndex);
  });

  store.dispatch(updateMatrix(patterns, values, item));
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
        <div className="playbox playbox-cycle" style={{width:"7.5%"}}>/~-~/</div>
      {_.map(channels, c => {
        return <input className = "playbox" id = {c} key = {c}
        placeholder={".^.^."}
        value = {ctx.state.transition[_.indexOf(channels, c)]}
        style = {{margin: 5}}
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
  const {steps, channels, timer, play} = ctx.state;
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
    ctx.setState({play:true});
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
  temp[_index] = value;
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

      // const getAnimationTime = (className) => {
      //   var duration = timer.timer[_index].duration;
      //   var animationTime = duration/steps;
      //
      //   var styleCSS = "background-color: rgba(255,255,102,0.15)!important;"
      //
      //   if(className.indexOf("active") !== -1){
      //     styleCSS = "-webkit-transition: "+animationTime+" ease-in-out;\
      //                     -moz-transition: "+animationTime+" ease-in-out;\
      //                     -o-transition: "+animationTime+" ease-in-out;\
      //                     " + styleCSS;
      //   }
      //
      //   return styleCSS;
      // }
      // dynamic cell height
      const cellHeight = 85/steps;

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


      // dynamic text size
      const textSize = textval.length > 10 ? Math.max( 0.65, mapNumbers(textval.length, 10, 30, 1, 0.65)) : 1;
      return <div className={individualClass} style={css} key={c+'_'+i}>
        <textarea type="text" style={{fontSize: textSize+'vw'}}value={textval} onChange={setText} id = {c+','+i} onKeyUp = { ctx.handleSubmitCell.bind(ctx)}/>
      </div>
    })}
  </div>;
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
    console.log(event.target.id);
    console.log(i);
    console.log(c);
    store.dispatch(assignTimer(timer.timer[c], steps, i))
    ctx.sendPatterns(tidalServerLink,{[c]: text}, getScenePatterns(),solo, transition, channels,timer.timer[c]);
  }
}

changeName({target: { value }}) {
  const ctx = this;
  ctx.setState({ matName: value , sceneSentinel: false});
}

addItem() {
  const ctx = this;
  var patterns = [];
  const { matName, activeMatrix, values, sceneIndex } = ctx.state;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];
  console.log("PROPS: ",ctx.props);
  const { uid } = ctx.props.user.user;
  // console.log(items);
  if(uid !== null || uid !== undefined){
    _.each(items, function(d){
      if(d.uid === uid && d.matName === activeMatrix){
        patterns = d.patterns;
      }
    })

    if ( matName.length >= 2 && !_.isEmpty(values)) {
      var snd = Object.values(items).length;

      fbcreateMatrix(ctx.state.modelName, { matName, patterns, values, sceneIndex: snd, uid});
      ctx.setState({sceneIndex: snd});
    }
    ctx.setState({activeMatrix: matName});
  }
}

reorder (index,flag){

  const ctx = this;
  const { matName, values, sceneIndex } = ctx.state;
  const items = ctx.props[ctx.state.modelName.toLowerCase()];

  if(ctx.props.user !== null && ctx.props.user !== undefined){
    console.log('items: ', items, Object.values(items));

    const vals = _.find(Object.values(items), (d) => d.uid === ctx.props.user.user.uid);
    // console.log('keys', keys, 'vals', vals);
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

          fborder(ctx.state.modelName, {matName: upMatName,   patterns: upPatterns, values: upValues, sceneIndex: index, uid: upUID},    keys[upIndex]);
          fborder(ctx.state.modelName, {matName: downMatName, patterns: downPatterns, values: downValues, sceneIndex: upIndex, uid: downUID},  keys[index]);
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

          fborder(ctx.state.modelName, {matName: downMatName, patterns: downPatterns, values: downValues, sceneIndex: index, uid: downUID}, keys[downIndex]);
          fborder(ctx.state.modelName, {matName: upMatName,   patterns: upPatterns, values: upValues, sceneIndex: downIndex, uid: upUID}, keys[index]);
        }
      }
    }
  }
}


renderItem(item, dbKey, i) {
  const ctx = this;
  const { values, activeMatrix} = ctx.state;
  const { patterns } = ctx.props;
  const model = fetchModel(ctx.state.modelName);

  const updateMatrix = () => {
    ctx.setState({ activeMatrix: item.matName, matName: item.matName, sceneSentinel: true });
    ctx.updateMatrix(patterns, values, item);
  }

  const handleDelete = ({ target: { value }}) => {
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
  // console.log(values);
  for (var i = 0; i < channels.length*steps; i++) {

      values [i] = [];

  }
  ctx.setState({values});
}

toggleCanvas(){
  const ctx = this;
  console.log('props', ctx.props);
  ctx.setState({isCanvasOn: !ctx.state.isCanvasOn});
}

renderMenu(){
  const ctx=this;
  const { tidal, timer, click, patterns }=ctx.props;
  const { scPattern, tidalServerLink, play, values, steps, channels}=ctx.state;

  const updateTidalServerLink=({ target: { value } }) => {
      ctx.setState({ tidalServerLink: value });
  }

  const updateScPattern = (obj)  => {
    ctx.setState({scPattern: obj.value})
  }
  // REPLACING START PAUSE STOP WITH IMAGES
  //<pre style={{marginTop: '0px'}}>{JSON.stringify(timer, null, 2)}</pre>

  return   <div className="Tidal" style={{margin: '5px'}}>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
      Username
      {ctx.props.user.user.name && <input type="String" value={ctx.props.user.user.name}/>}
      {!ctx.props.user.user.name && <input type="String" value={'Please login!'}/>}
    </div>
    <br/>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
   {!tidal.isActive && <button className={'buttonSentinel'} onClick={ctx.runTidal.bind(ctx)}>Start SC</button>}
   {tidal.isActive && <button className={'buttonSentinel'}>Running</button>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
    {!play && <img src={require('../assets/play@3x.png')} onClick={ctx.startTimer.bind(ctx)} height={32} width={32}/>}
    {play && <div> <img src={require('../assets/pause@3x.png')} onClick={ctx.pauseTimer.bind(ctx)} height={32} width={32}/>
                             <img src={require('../assets/stop@3x.png')} onClick={ctx.stopTimer.bind(ctx)} height={32} width={32}/> </div>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
      {ctx.state.isCanvasOn && <button className={'buttonSentinel'} onClick={ctx.toggleCanvas.bind(ctx)}>{"Canvas Off"}</button>}
      {!ctx.state.isCanvasOn && <button className={'buttonSentinel'} onClick={ctx.toggleCanvas.bind(ctx)}>{"Canvas On"}</button>}
    </div>
    <br/>
    <div id="Pattern">
        <p>  </p>
        <p>Console</p>
       <textarea className="defaultPatternArea" value={scPattern} onChange={updateScPattern} placeholder={'SuperCollider (Ctrl + Enter) '} onKeyUp={ctx.handleSubmit.bind(ctx)} rows="20" cols="30"/>
      </div>
  </div>
}



render() {
  const ctx=this;
  const { tidal, timer, click }=ctx.props;
  const { patterns, isCanvasOn }=ctx.props;
  // const { patterns }=ctx.state;
  const { scPattern, tidalServerLink, values, steps, channels, songmodeActive, activeMatrix }=ctx.state;


  const viewPortWidth = '100%'

  const items = ctx.props[ctx.state.modelName.toLowerCase()];

  return <div >
  <div className={"Home cont"}>
  {ctx.state.isCanvasOn && <Simple width={window.innerWidth} height={window.innerHeight} timer={timer}/>}
  <Layout fill='window'>
      <Layout layoutWidth={120}>
        <div id="matrices" style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin: '2px'}}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px'}}>
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
        <div className="Patterns" >
          <div className="PatternsColumn" >
            <Patterns active={activeMatrix}/>
          </div>
        </div>
      </Layout>
      <LayoutSplitter />
      <Layout layoutWidth={200}>
        <div style={{display:'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          {ctx.renderMenu()}
          <div id="Execution" style={{alignSelf:'center'}}>
            <textarea className="defaultPatternArea"  onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder="Tidal (Ctrl + Enter)" width={'100%'}/>
          </div>
          <div id="Execution" style={{alignSelf:'center'}}>
            <textarea className="defaultPatternArea"  onKeyUp={ctx.handleGlobalCommands.bind(ctx)} placeholder="Global Command (Ctrl + Enter)" width={'100%'}/>
            <textarea className="defaultPatternArea"  onKeyUp={ctx.handleGlobalFunctions.bind(ctx)} placeholder="Global Function (Ctrl + Enter)" width={'100%'}/>
          </div>
         </div>
      </Layout>
    </Layout>
    </div>
  </div>
  }
}
export default connect(state => state)(Home);
