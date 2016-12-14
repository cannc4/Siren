import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

import { initMyTidal,sendScCommand, sendSCMatrix, sendCommands, startTimer, stopTimer,
          celluarFill, celluarFillStop, addValues,
          bjorkFill, bjorkFillStop, addBjorkValues,
          consoleSubmit, fbcreateMatrix, fbdelete, fetchModel, fetchModels, updateMatrix} from '../actions'
import store from '../store';
import Commands from './Commands.react';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state={
      matName: "",
      modelName : "Matrices",
      tidalServerLink: 'localhost:3001',
      duration: 8,
      steps: 8,
      channels: ['m1','m2','m3', 'm4', 'm5','m6','m7', 'm8', 'm9','m10','m11','m12',
              'sendOSC procF_t','sendOSC procF_v',
              'sendOSC procS1', 'sendOSC procS2'],
      timer: { isActive: false,
               current: null,
               isCelluarActive: false,
               isBjorkActive: false },
      values: {},
      scCommand: '',
      density: 8
    }
  }

  componentDidUpdate(props, state) {
    const ctx=this;
    const { channelcommands, commands, timer }=props;
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
        if(vals['~qcap']!= ''){
          const sccm = vals['~qcap']
          const cmd = _.find(commands, c => c.name === sccm);
          console.log(cmd);
          //ctx.setState({scCommand : cmd});
          //ctx.sendScCommand(tidalServerLink,cmd);


        }
        ctx.sendCommands(tidalServerLink, vals, channelcommands, commands);
      //   if(_includes(Object.keys(vals), "SC")){
      //   console.log(true);
      // }
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
          return <div className="playbox" key={c}><div>{c}</div></div>
        })}
      </div>
      {_.map(Array.apply(null, Array(steps)), ctx.renderStep.bind(ctx))}
    </div>)
  }

  renderStep(x, i) {
    const ctx=this;
    const { channels, steps }=ctx.state;
    const { commands, timer }=ctx.props;
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
          {' . '}
          <input type="text" value={textval} onChange={setText}/>
        </div>
      })}
    </div>;
  }

  changeName({target: { value }}) {
    const ctx = this;
    //updateValues(value, ctx.commands, ctx.values);
    ctx.setState({ matName: value });
  }

  addItem() {
    const ctx = this
    const { commands } = ctx.props;
    const { matName, values } = ctx.state;
    if (matName.length >= 2 && _.isEmpty(values) === false) {
      fbcreateMatrix(ctx.state.modelName, { matName , commands, values })
    }
  }

  renderItem(item, dbKey, i) {
    const ctx = this;
    const { values } = ctx.state;
    const model = fetchModel(ctx.state.modelName);

    const updateMatrix = () => {
      const { commands } = ctx.props;
      ctx.updateMatrix(values, item,commands);
    }

    // handle function to delete the object
    const handleDelete = ({ target: { value }}) => {
      const payload = { key: dbKey };
      fbdelete(ctx.state.modelName, payload);
    }

    return item.key && (
      <div key={item.key} className="matrices" >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '1px'}}>
          <button onClick={handleDelete}>{'x'}</button>
          <button onClick={updateMatrix}>{item.matName}</button>
        </div>
      </div>
    )
  }

  renderItems(items) {
    const ctx = this;
    return _.map(items, ctx.renderItem.bind(ctx));
  }

  render() {
    const ctx=this;
    const { tidal, timer }=ctx.props;
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

    const items = ctx.props[ctx.state.modelName.toLowerCase()];

    return <div className="Home cont">
      {ctx.renderPlayer()}
      <div id="matrices" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin: '2px'}}>
        <div style={{ width: 'calc(' + viewPortWidth + ' - 50px)', display: 'flex', flexDirection: 'column', padding: '2px'}}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

            <div>
            <input type="text" placeholder= "Scene" value={ctx.state.matName} onChange={ctx.changeName.bind(ctx)}/>
              <button onClick={ctx.addItem.bind(ctx)}>Add</button>
            </div>
          </div>
        </div>
        <div style={{ width: 'calc(' + viewPortWidth + ' - 50px)' }}>
          <ul style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '0', margin: '0'}}>
            {ctx.renderItems(items)}
          </ul>
        </div>
      </div>

      <div id="CommandsColumn" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin: '2px'}}>
        <div className="Commands"  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '2px'}}>
          <Commands />
        </div>
        <div id="Execution"  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', padding: "2px", paddingBottom: "25px"}}>
          <textarea className="easter" style={{minHeight: "100px"}} onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder=""/>
        </div>
      </div>

      <div className="Tidal">
        Tidal Server Link
        <input type="text" value={tidalServerLink} onChange={updateTidalServerLink}/>
        <button onClick={ctx.runTidal.bind(ctx)}>Start SC</button>
        {tidal.isActive && 'Running!'}
        {!timer.isActive && <button onClick={ctx.startTimer.bind(ctx)}>Start timer</button>}
        {timer.isActive && <button onClick={ctx.stopTimer}>Stop timer</button>}
        <pre>{JSON.stringify(timer, null, 2)}</pre>
        <div id="Command">
           Interpreter
           <input type="textarea" value={scCommand} onChange={updateScCommand} placeholder="" onKeyUp={ctx.handleSubmit.bind(ctx)} rows="20" cols="30"/>
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


    </div>
  }
}
export default connect(state => state)(Home);
