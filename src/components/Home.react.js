import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import './Home.css';
import { initMyTidal,sendScCommand, sendCommands, startTimer, stopTimer } from '../actions'
import store from '../store';
import Commands from './Commands.react';

class Home extends Component {
  constructor() {
    super();
    this.state = {

      tidalServerLink: 'localhost:3001',
      duration: 16,
      steps: 16,
      channels: ['m1','m2','m3', 'm4', 'd5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'm16' ],
      timer: { isActive: false, current: null },
      values: {},
      scCommand: ''
    }
  }

  componentDidUpdate(props, state) {

    const ctx = this;
    const { channelcommands, commands, timer } = props;
    const { steps, tidalServerLink, values } = state;
    if (timer.isActive) {
      const runNo = (timer.current % steps) + 1;


      const vals = values[runNo];
      const texts = []
      if (vals !== undefined) {

        ctx.sendCommands(tidalServerLink, vals, channelcommands, commands);

      } //  console.log("2001");
    }
}


  startTimer() {
    const ctx = this;
    const { duration, steps } = ctx.state;
    store.dispatch(startTimer(duration, steps));
  }

  stopTimer() {
    store.dispatch(stopTimer());
  }

  runTidal() {
    const ctx = this;
    const { tidalServerLink } = ctx.state;
    store.dispatch(initMyTidal(tidalServerLink));
  }


  sendCommands(tidalServerLink, vals, channelcommands, commands) {
    //console.log("2002");
    store.dispatch(sendCommands(tidalServerLink, vals, channelcommands, commands));
  }

  sendScCommand(tidalServerLink, command) {
    store.dispatch(sendScCommand(tidalServerLink, command));
  }

  handleSubmit = event => {
      const body = event.target.value
      const ctx = this;
      const {scCommand, tidalServerLink } = ctx.state;

      if(event.keyCode === 13 && event.ctrlKey && body){
        ctx.sendScCommand(tidalServerLink, scCommand)
        console.log(scCommand);
      }
    }

  renderCommand(command) {
    const ctx = this;
    const { tidalServerLink } = ctx.state;

    // const sendCommand = () => {
    //   // console.log('sendCommand', tidalServerLink, command.command);
    //   ctx.sendCommand(tidalServerLink, command.command);
    // }
    //return (<div key={command.key} className="Command">{command.command} {ctx.props.tidal.isActive && <button onClick={sendCommand}>send <b>{command.name}</b></button>}</div>)
  }

  renderCommands() {
    const ctx = this;
    const { commands } = ctx.props;
    return _.map(commands, ctx.renderCommand.bind(ctx))
  }

  renderPlayer() {
    const ctx = this;
    const { channels, steps } = ctx.state;
    const playerClass = "Player Player--" + (channels.length + 1.0) + "cols";
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
    const ctx = this;
    const { channels, steps } = ctx.state;
    const { commands, timer } = ctx.props;
    const cmds = _.uniq(_.map(commands, c => c.name));
    const currentStep = timer.current % steps;
    var playerClass = "Player Player--" + (channels.length + 1.0) + "cols";
    if (i === currentStep) {
      playerClass += " playbox-active";
    }

    return <div key={i} className={playerClass}>
      <div className="playbox playbox-cycle">{i+1}</div>
      {_.map(channels, c => {
        const setText = ({ target: { value }}) => {
            const {values} = ctx.state;
            if (values[i+1] === undefined) values[i+1] = {}
            values[i+1][c] = value;
            ctx.setState({values});
            if (cmds.indexOf(value) > -1){
              const cmd = _.find(commands, c => c.name === value);
              if (cmd !== undefined && cmd !== null) {

                  //ctx.sendCommand(ctx.state.tidalServerLink, c + " $ " + cmd.command);
                  //store.dispatch(setCommand(c, c+' $ '+cmd.command));
              }
            }
        }

        const getValue = () => {
          const values = ctx.state.values;
          if (values[i+1] === undefined || values[i+1][c] === undefined) return ''
          return values[i+1][c];
        }

        const textval = getValue()

        return <div className="playbox" key={c+'_'+i}>
          {' . '}
          <input type="text" value={textval} onChange={setText}/>
        </div>
      })}
    </div>;
  }

  render() {
    const ctx = this;
    const { tidal, timer } = ctx.props;
    const { scCommand, tidalServerLink } = ctx.state
    const updateTidalServerLink = ({ target: { value } }) => {
        ctx.setState({ tidalServerLink: value });
    }

    const updateScCommand = ({ target: { value } }) => {
      ctx.setState({scCommand: value})
    }
    const sendSc = () => {
      ctx.sendScCommand(tidalServerLink, scCommand)
    }

    //{ctx.renderCommands()}
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
     <input type= "textarea" value={scCommand} onChange={updateScCommand} placeholder="" onKeyUp = {ctx.handleSubmit.bind(ctx)} rows="20" cols="30"/>
      </div>
      </div>
    </div>
  }
}
export default connect(state => state)(Home);
