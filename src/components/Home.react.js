import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';

import { initMyTidal,sendScCommand, sendCommands, startTimer, stopTimer, celluarFill, celluarFillStop, addValues} from '../actions'
import store from '../store';
import Commands from './Commands.react';

class Home extends Component {
  constructor() {
    super();
    this.state={
      tidalServerLink: 'localhost:3001',
      duration: 8,
      steps: 16,
      channels: ['d1','d2','d3', 'd4', 'd5','d6','d7', 'd8', 'd9',
              'sendOSC procF_t','sendOSC procF_v',
              'sendOSC procS1', 'sendOSC procS2',
              'sendOSC procS3', 'sendOSC procS4' ],
      timer: { isActive: false, current: null, isCelluarActive: false },
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

      if(timer.current % steps === 1 && timer.isCelluarActive){
        ctx.celluarFill(values, commands, density, steps, duration, channels, timer);
      }

      const vals=values[runNo];
      if (vals !== undefined) {
        ctx.sendCommands(tidalServerLink, vals, channelcommands, commands);
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

  sendCommands(tidalServerLink, vals, channelcommands, commands, channels) {
    //console.log("2002");
    store.dispatch(sendCommands(tidalServerLink, vals, channelcommands, commands));
  }

  sendScCommand(tidalServerLink, command) {
    store.dispatch(sendScCommand(tidalServerLink, command));
  }

  addValues(values, commands, density, steps, duration, channels, timer){
    store.dispatch(addValues(values, commands, density, steps, duration, channels, timer));
  }

  celluarFill(values, commands, density, steps, duration, channels, timer){
    //this.stopTimer();
    store.dispatch(celluarFill(values, commands, density, steps, duration, channels, timer));
    //this.startTimer();
  }

  celluarFillStop(){
    store.dispatch(celluarFillStop());
  }

  handleSubmit=event => {
      const body=event.target.value
      const ctx=this;
      const {scCommand, tidalServerLink }=ctx.state;

      if(event.keyCode === 13 && event.ctrlKey && body){
        ctx.sendScCommand(tidalServerLink, scCommand);
      }
    }
  renderPlayer() {
    const ctx=this;
    const { channels, steps }=ctx.state;
    const playerClass="Player Player--" + (channels.length + 1.0) + "cols";
    return (<div className="Player-holder">
      <div className={playerClass}>
        <div className="playbox playbox-cycle">cycle</div>
        {_.map(channels, c => {
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
            values[i+1][c]=value;
            ctx.setState({values});
            if (cmds.indexOf(value) > -1){
              const cmd=_.find(commands, c => c.name === value);
              if (cmd !== undefined && cmd !== null) {

                  //ctx.sendCommand(ctx.state.tidalServerLink, c + " $ " + cmd.command);
                  //store.dispatch(setCommand(c, c+' $ '+cmd.command));
              }
            }
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
          <input id={"pt_pop_"+index} type="text" value={textval} onChange={setText}/>
          <div className={"messagepop_"+index+" pop_"+index} id="messagepop_hidden">
            <textarea id={"pt_area_pop_"+index} type="String"></textarea>
          </div>
        </div>
      })}
    </div>;
  }

  render() {
    const ctx=this;
    const { tidal, timer }=ctx.props;
    const { scCommand, tidalServerLink }=ctx.state;

    const { commands }=ctx.props;
    const { values, density, steps, duration, channels}=ctx.state;
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
    /*const sendSc=() => {
      ctx.sendScCommand(tidalServerLink, scCommand)
    }*/

    return <div className="Home cont">
      {ctx.renderPlayer()}
      <div className="Commands">
        <Commands />
      </div>
      <div className="Tidal">
        Tidal Server Link <input type="text" value={tidalServerLink} onChange={updateTidalServerLink}/>
      <button onClick={ctx.runTidal.bind(ctx)}>Start Tidal</button>{tidal.isActive && 'Running!'}
      {!timer.isActive && <button onClick={ctx.startTimer.bind(ctx)}>Start timer</button>}
      {timer.isActive && <button onClick={ctx.stopTimer}>Stop timer</button>}
      <pre>{JSON.stringify(timer, null, 2)}</pre>

      <div id="Command">
       Interpreter
       <input type="textarea" value={scCommand} onChange={updateScCommand} placeholder="" onKeyUp={ctx.handleSubmit.bind(ctx)} rows="20" cols="30"/>
      </div>

      <div id="Celluar">
       Celluar Automata Density
       <input type="textarea" value={textval} onChange={updateDensity} placeholder="" rows="20" cols="30"/>
       {!timer.isCelluarActive && <button onClick={celluarFill}>Run</button>}
       {timer.isCelluarActive && <button onClick={celluarFillStop}>Stop</button>}
       <button onClick={addValues}>Add Values</button>
      </div>
      </div>
    </div>
  }
}
export default connect(state => state)(Home);
