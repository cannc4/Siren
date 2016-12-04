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
      duration: 64,
      steps: 128,
      channels: ['d1','d2','m3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'm16' ],
      timer: { isActive: false, current: null },
      values: {},
      scCommand: ''
    }

  }
componentDidMount() {
      const ctx = this;
      const { timer } = this.props;
      document.addEventListener("keyup" , function() {
        console.log("4000003")
        if(event.keyCode === 32){
          if(!timer.isActive){
            ctx.startTimer();
            console.log("4000004")
            ctx.setState({timer: {isActive : true} })
          }
          else {
            console.log("4000005")
            ctx.stopTimer();
            ctx.setState({timer: {isActive : false} })
        }
      }
      });
    }

  componentDidUpdate(props, state) {

    const ctx = this;
    const { channelcommands, commands, timer } = props;
    const { steps, tidalServerLink, values } = state;
    if (timer.isActive) {
      const runNo = (timer.current % steps);


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
    //Values [step][channel]
    //Values need to be an object instead of a string for the popup structure

    return <div key={i} className={playerClass}>
      <div className="playbox playbox-cycle">{i+1}</div>
      {_.map(channels, c => {
        const setText = ({ target: { value }}) => {
            const {values} = ctx.state;
            if (values[i+1] === undefined) values[i+1] = ''
            values[i+1][c] = value;
                        //console.log(values[i+1][c].isHid);

            ctx.setState({values});
          }

        const getValue = () => {
          const values = ctx.state.values;

          if (values[i+1] === undefined || values[i+1][c] === undefined) return ''
          return values[i+1][c].valuetxt;
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

    return <div className="Home cont">
      {ctx.renderPlayer()}
      <div className="Commands">
        <Commands />
      </div>
      <div className="Tidal">
        Tidal Server Link <input type="text" value={tidalServerLink} onChange={updateTidalServerLink}/>
      <button onClick={ctx.runTidal.bind(ctx)}>Start Tidal</button>{tidal.isActive && 'Running!'}

      {<button onClick={ctx.stopTimer}>Stop timer</button>}
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
