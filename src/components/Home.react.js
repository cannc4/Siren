import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

import { initMyTidal,sendScCommand, sendSCMatrix, sendCommands, startTimer, stopTimer,
          celluarFill, celluarFillStop, addValues,
          bjorkFill, bjorkFillStop, addBjorkValues,
          consoleSubmit, fbcreateMatrix, fbupdateMatrix, fbdelete,fborder, fetchModel, fetchModels, updateMatrix, startClick,stopClick} from '../actions'
import store from '../store';
import Commands from './Commands.react';

import {Layout, LayoutSplitter} from 'react-flex-layout';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state={
      matName: "",
      modelName : "Matrices",
      tidalServerLink: 'localhost:3001',
      duration: 48,
      steps: 16,
      channels: ['d1','d2','d3', 'd4', 'd5','d6','d7', 'd8',
              'sendOSC procS1','sendOSC procS2',
              'sendOSC procS3', 'sendOSC procS4'],
      timer: { isActive: false,
               current: null,
               isCelluarActive: false,
               isBjorkActive: false },
      values: {},
      scCommand: '',
      click : {current:null,
              isActive:false},
      density: 8,
      activeMatrix: '',
      sceneSentinel: false
    }
  }

  componentDidMount(props,state){
    const ctx = this;

      var socket = io('http://localhost:3003/'); // TIP: io() with no args does auto-discovery
      socket.on("osc", data => {

        this.startClick();
      })
      socket.on("dc", data => {
        this.stopClick();
      })


    }

    startClick() {
      const ctx=this;
      store.dispatch(startClick());
    }

  componentDidUpdate(props, state) {

    const ctx=this;
    const { channelcommands, commands, timer ,click}=props;
    const { steps, tidalServerLink, values, density, duration, channels }=state;
    if (timer.isActive) {
      const runNo=(timer.current % steps) + 1;

      if(timer.current % steps === 1 && (timer.isCelluarActive || timer.isBjorkActive)){
        if(timer.isCelluarActive)
          ctx.celluarFill(values, commands, density, steps, duration, channels, timer);
        else
          ctx.bjorkFill(values, commands, density, steps, duration, channels, timer);

        /*var countArr = [];
        _.forEach(channels, function(channel, c_key){
          var count = 0;
          _.forEach(values, function(rowValue, rowKey) {
            if(values[rowKey] !== undefined && values[rowKey][channel]) {
              count++;
            }
          });
          countArr[c_key] = count;
        });*/
      }

      const vals=values[runNo];
      // const names = Object.keys(vals);
      // console.log(names);
      if (vals !== undefined) {
        ctx.sendCommands(tidalServerLink, vals, channelcommands, commands );

    }
  }
}


  startTimer() {
    const ctx=this;
    const { duration, steps }=ctx.state;
    store.dispatch(startTimer(duration, steps));
  }

  stopTimer() {
    store.dispatch(stopTimer());
  }

  runTidal() {
    const ctx=this;
    const { tidalServerLink }=ctx.state;
    store.dispatch(initMyTidal(tidalServerLink));
  }

  sendCommands(tidalServerLink, vals, channelcommands, commands) {
    store.dispatch(sendCommands(tidalServerLink, vals, channelcommands, commands));
  }
  sendSCMatrix(tidalServerLink, vals, commands) {
    store.dispatch(sendSCMatrix(tidalServerLink, vals, commands));
  }

  sendScCommand(tidalServerLink, command) {
    store.dispatch(sendScCommand(tidalServerLink, command));
  }

  addValues(values, commands, density, steps, duration, channels, timer){
    store.dispatch(addValues(values, commands, density, steps, duration, channels, timer));
  }
  celluarFill(values, commands, density, steps, duration, channels, timer){
    store.dispatch(celluarFill(values, commands, density, steps, duration, channels, timer));
  }
  celluarFillStop(){
    store.dispatch(celluarFillStop());
  }

  addBjorkValues(values, commands, density, steps, duration, channels, timer){
    store.dispatch(addBjorkValues(values, commands, density, steps, duration, channels, timer));
  }
  bjorkFill(values, commands, density, steps, duration, channels, timer){
    store.dispatch(bjorkFill(values, commands, density, steps, duration, channels, timer));
  }
  bjorkFillStop(){
    store.dispatch(bjorkFillStop());
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

  updateMatrix(values, item) {
    store.dispatch(updateMatrix(values, item));
  }

  renderPlayer() {
    const ctx=this;
    const { channels, steps }=ctx.state;
    const playerClass="Player Player--" + (channels.length + 1.0) + "cols";
    var count = 1;
    return (<div className="Player-holder">
      <div className={playerClass}>
        <div className="playbox playbox-cycle">cycle</div>
        {_.map(channels, c => {
          if(_.includes(c, "sendOSC")){
            c = "p"+count++;
          }
          return <div className="playbox playbox-cycle" key={c}>{c}</div>
        })}
      </div>
      {_.map(Array.apply(null, Array(steps)), ctx.renderStep.bind(ctx))}
    </div>)
  }

  renderStep(x, i) {
    const ctx=this;
    const { channels, steps }=ctx.state;
    const { commands, timer,click }=ctx.props;
    const cmds=_.uniq(_.map(commands, c => c.name));
    const currentStep=timer.current % steps;
    var playerClass="Player Player--" + (channels.length + 1.0) + "cols";
    if (i === currentStep) {
      playerClass += " playbox-active";
    }
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

        return <div className="playbox" key={c+'_'+i}>
          <textarea type="text" value={textval} onChange={setText}/>
        </div>
      })}
    </div>;
  }

  changeName({target: { value }}) {
    const ctx = this;
    ctx.setState({ matName: value , sceneSentinel: false});
  }

  addItem() {
    const ctx = this
    const { commands } = ctx.props;
    const { matName, activeMatrix, values } = ctx.state;
    if ( matName.length >= 2 && _.isEmpty(values) === false) {
      fbcreateMatrix(ctx.state.modelName, { matName , commands, values })
    }
  }

  renderItem(item, dbKey, i) {
    const ctx = this;
    const { values, activeMatrix } = ctx.state;
    const model = fetchModel(ctx.state.modelName);

    const updateMatrix = () => {
      const { commands } = ctx.props;
      ctx.setState({ activeMatrix: item.matName, matName: item.matName, sceneSentinel: true });
      ctx.updateMatrix(values, item, commands);
    }


    const handleDelete = ({ target: { value }}) => {
      const payload = { key: dbKey };
      fbdelete(ctx.state.modelName, payload);
    }


    const reorder = (flag, index) => {

      const payload = { key: dbKey };
      const ctx=this;
      const { matName, commands, values } = ctx.state
      const items = ctx.props[ctx.state.modelName.toLowerCase()];
      const len = Object.keys(items).length;
      console.log(index);
      console.log(flag);
      //
      // if(flag == "up" && parseInt(index)== 0)
      //   return;
      // else if(flag == "down" && len-1 == parseInt(index))
      //   return;
      // else{
      //   if(flag == "up")
      //     //fborder(ctx.state.matName, { matName , commands, values, index});
      //   else if(flag == "down")
      //     //fborder(ctx.state.matName, { matName , commands, values, index});
      //   }
      }
    return item.key && (
      <div key={item.key} className="matrices" >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '1px'}}>
          <button onClick={handleDelete}>{'₪'}</button>
          {activeMatrix === item.matName && <button className={'buttonSentinel'} onClick={updateMatrix} style={{ color: 'rgba(255,255,102,0.75)'}}>{item.matName}</button>}
          {activeMatrix !== item.matName && <button className={'buttonSentinel'} onClick={updateMatrix} style={{ color: '#ddd'}}>{item.matName}</button>}
          <button onClick={reorder('up', item.sceneIndex)}>{'↑'} </button>
          <button onClick={reorder('down', item.sceneIndex)}>{'↓'}</button>
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
  renderMenu(){
    const ctx=this;
    const { tidal, timer, click }=ctx.props;
    const { scCommand, tidalServerLink }=ctx.state;
    const { commands }=ctx.props;
    const { values, density, steps, duration, channels}=ctx.state;

    const bjorkFillStop=() => {
      ctx.bjorkFillStop();
    }
    const bjorkFill=() => {
      ctx.bjorkFill(values, commands, density, steps, duration, channels, timer)
    }
    const addBjorkValues =() => {
      ctx.addBjorkValues(values, commands, density, steps, duration, channels, timer)
    }

    const celluarFillStop=() => {
      ctx.celluarFillStop();
    }
    const celluarFill=() => {
      ctx.celluarFill(values, commands, density, steps, duration, channels, timer)
    }
    const addValues=() => {
      ctx.addValues(values, commands, density, steps, duration, channels, timer)
    }
    const updateDensity=({ target: { value } }) => {

      ctx.setState({density: value});
    }
    const getValue=() => {
        return ctx.state.density;
    }
    const textval=getValue();
    const updateTidalServerLink=({ target: { value } }) => {
        ctx.setState({ tidalServerLink: value });
    }

    const updateScCommand=({ target: { value } }) => {
      ctx.setState({scCommand: value})
    }

    const viewPortWidth = '100%'
    return   <div className="Tidal" style={{margin: '5px'}}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
        Tidal Server Link
        <input type="text" value={tidalServerLink} onChange={updateTidalServerLink}/>
        {!tidal.isActive && <button className={'buttonSentinel'} onClick={ctx.runTidal.bind(ctx)}>Start SC</button>}
        {tidal.isActive && <button className={'buttonSentinel'}>Running</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
        {!timer.isActive && <button className={'buttonSentinel'} onClick={ctx.startTimer.bind(ctx)}>Start timer</button>}
        {timer.isActive && <button className={'buttonSentinel'} onClick={ctx.stopTimer}>Stop timer</button>}
        <pre style={{marginTop: '0px'}}>{JSON.stringify(timer, null, 2)}</pre>
      </div>
      <div id="Command">
         <p>SuperCollider Command</p>
         <input type="textarea" value={scCommand} onChange={updateScCommand} placeholder={'Ctrl + Enter '} onKeyUp={ctx.handleSubmit.bind(ctx)} rows="20" cols="30"/>
      </div>
      <div id="Celluar">
         <p>Cellular Automata Updates</p>
         <input type="textarea" value={textval} onChange={updateDensity} placeholder="" rows="20" cols="30"/>
         {!timer.isCelluarActive && <button onClick={celluarFill}>Run</button>}
         {timer.isCelluarActive && <button onClick={celluarFillStop}>Stop</button>}
         <button onClick={addValues}>  Add  </button>
      </div>
      <div id="Celluar">
         <p>Bjorklund Algorithm Updates</p>
         {!timer.isBjorkActive && <button onClick={bjorkFill}>Run</button>}
         {timer.isBjorkActive && <button onClick={bjorkFillStop}>Stop</button>}
         <button onClick={addBjorkValues}>  Add  </button>
      </div>
    </div>
  }



  render() {
    const ctx=this;
    const { tidal, timer, click }=ctx.props;
    const { scCommand, tidalServerLink }=ctx.state;
    const { commands }=ctx.props;
    const { values, density, steps, duration, channels}=ctx.state;

    const getValue=() => {
        return ctx.state.density;
    }
    const textval=getValue();

    const viewPortWidth = '100%'

    const items = ctx.props[ctx.state.modelName.toLowerCase()];

    return <div className={"Home cont"}>
      <Layout fill='window'>
        <Layout layoutWidth={120}>
          <div id="matrices" style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin: '2px'}}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px'}}>
              <input className={'newCommandInput'} placeholder={'New Scene Name'} value={ctx.state.matName} onChange={ctx.changeName.bind(ctx)}/>
              {this.state.sceneSentinel && <button onClick={ctx.addItem.bind(ctx)}>Update</button>}
              {!this.state.sceneSentinel && <button  onClick={ctx.addItem.bind(ctx)}>Add</button>}
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
              <Commands />
            </div>

          </div>
        </Layout>
        <LayoutSplitter />
        <Layout layoutWidth={200}>
          <div style={{display:'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            {ctx.renderMenu()}
            <div id="Execution" style={{alignSelf:'flex-start'}}>
              <textarea className="defaultCommandArea"  onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder="Tidal Command Here (Ctrl + Enter)"/>
            </div>
          </div>
        </Layout>
      </Layout>
    </div>

  }
}
export default connect(state => state)(Home);
