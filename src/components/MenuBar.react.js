import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import io from 'socket.io-client';
import _ from 'lodash';

import './style/MenuBar.css'

import { GitHubLogin, logout, chokeClick, resetClick,
         initTidalConsole, sendScPattern, saveScBootInfo,
         startClick, stopClick} from '../actions'

var keymaster = require('keymaster');

class MenuBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      path: location.pathname,
      paths: [ {
        name: 'Home',
        url: '/'
        },  {
        name: 'Canvas',
        url:'/live'
      }],
      username: 'vou',
      tidalServerLink: 'localhost:3001',
      times: 2,
      serversListening: false,
      socket_tick: io('http://localhost:3003/')
    }
  }

  componentDidMount(props,state){
    const ctx = this;
    const { socket_tick } = ctx.state;

 
    
    socket_tick.on('connect', (reason) => {
      console.log("Port 3003 Connected: ", reason);
      ctx.setState({serversListening: true});
    });
    socket_tick.on("/tick2react", data => {
      // console.log("Port 3003 tick2react: ");
      store.dispatch(startClick());
    })

    socket_tick.on("/tick2react-done", data => {
      console.log("Port 3003 tick2react-done: ");
      store.dispatch(stopClick());
    })
    socket_tick.on('disconnect', (reason) => {
      console.log("Port 3003 Disconnected: ", reason);
      store.dispatch(saveScBootInfo({boot: 0, tidalMenu: false}));
      ctx.setState({serversListening: false});
    });
    store.dispatch(saveScBootInfo({boot:0, tidalMenu:false}));
    
    keymaster('ctrl+enter', ctx.toggleClick.bind(ctx));
    keymaster('shift+enter', ctx.stopTimer.bind(ctx));
  }

  componentWillUnmount(props, state) {
    const ctx = this;

    keymaster.unbind('ctrl+enter', ctx.toggleClick.bind(ctx));
    keymaster.unbind('shift+enter', ctx.stopTimer.bind(ctx));
  }

  componentDidUpdate() {
    const ctx = this;
    if (ctx.state.path !== location.pathname){
      ctx.setState({ path: location.pathname })
    }
  }

  ////////////////////////////// TIMER STARTS ////////////////////////////
  toggleClick = () => {
    store.dispatch(chokeClick())
  }

  startTimer = event => {
    store.dispatch(chokeClick());
  }

  stopTimer = event => {
    if(event.shiftKey)
      store.dispatch(resetClick());
    else {
      store.dispatch(chokeClick());
    }

  }
  ////////////////////////////// TIMER ENDS ////////////////////////////

  runTidal() {
    const ctx=this;
    const { tidalServerLink, socket_sc } = ctx.state;
    const { boot } = ctx.props.click.response;
    if(boot === 0){
      store.dispatch(initTidalConsole(tidalServerLink, ctx.props.user.user.config));
    }
    else {
      const scdstartfile = ctx.props.user.user.config.scd_start
      var scdstartfileAdjusted;

      // Windows
      if (_.indexOf(scdstartfile, '\\') !== -1) {
        scdstartfileAdjusted = _.join(_.split(scdstartfile, /\/|\\/), "\\\\");
      }
      // UNIX
      else {
        scdstartfileAdjusted = _.join(_.split(scdstartfile, /\/|\\/), '/');
      }

      const sc_load = "\"" + scdstartfileAdjusted + "\".load;";
      socket_sc.connect()
      store.dispatch(chokeClick())
      store.dispatch(sendScPattern(tidalServerLink, sc_load));
    }
  }

  stopTidal() {
    const ctx = this;
    const { tidalServerLink, socket_sc } = ctx.state;
    const sc_exit = "s.quit;"
    socket_sc.disconnect();
    store.dispatch(saveScBootInfo({boot: 1, tidalMenu: false}));
    store.dispatch(chokeClick())
    store.dispatch(sendScPattern(tidalServerLink, sc_exit));
  }

  render() {
    const ctx = this;

    const { times, serversListening } = ctx.state;
    const { click } = ctx.props;
    const { boot, tidalMenu } = ctx.props.click.response;

    const changeTimes = ({target: {value}}) => {
      ctx.setState({times : value});

      if (_.toInteger(value) === 0){
        value = 2;
      }
      ctx.props.click.times = _.toInteger(value);
    }

    const loginGG = () => {
      store.dispatch(GitHubLogin())
    }
    const fblogout = () => {
      ctx.setState({username: ''});
      store.dispatch(logout())
    }

    // needs improvement
    var serverStatusClass = 'ServerStatus';
    if (!serversListening) {
      serverStatusClass += ' inactive';
    }
    else if (serversListening && !tidalMenu) {
      serverStatusClass += ' ready';
    }
    else if (serversListening && tidalMenu) {
      serverStatusClass += ' running';
    }

    return (<div className='MenuBar boxshadow'>
      <div style={{display: 'flex', displayDirection: 'row'}}>
        <div className={'Logo'}>
        {<img role="presentation" src={require('../assets/logo.svg')}  height={35} width={35}/> }
        </div>
      </div>
      <div className={ctx.props.user.user.email ? 'enabledView' : 'disabledView'} style={{display: 'flex', flexDirection: 'row', height: 40}}>
        <div className={serverStatusClass}></div>
        {(!tidalMenu && boot === 0) && <button className={'Button draggableCancel ' + (serversListening ? ' enabledView' : ' disabledView')} onClick={ctx.runTidal.bind(ctx)}>Boot Server</button>}
        {(!tidalMenu && boot === 1) && <button className={'Button draggableCancel ' + (serversListening ? ' enabledView' : ' disabledView')} onClick={ctx.runTidal.bind(ctx)}>Start Server</button>}
        {tidalMenu && <button className={'Button draggableCancel ' + (serversListening ? ' enabledView' : ' disabledView') } onClick={ctx.stopTidal.bind(ctx)}>Stop Server</button>}
        <div className={"TimerControls"}>
          {!click.isActive && <img src={require('../assets/play@3x.png')} className={(tidalMenu ? 'enabledView' : 'disabledView')} onClick={ctx.startTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
          {click.isActive && <img src={require('../assets/stop@3x.png')} className={(tidalMenu ? 'enabledView' : 'disabledView')} onClick={ctx.stopTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
          <p style={{paddingLeft: 15, paddingRight: 5}}>{'Rate: '}</p>
          <input className={'TimesInput'} value={times} onChange={changeTimes}/>
        </div>
      </div>
      <div className={"User"}>
        <div>
          {ctx.props.user.user.email && <button style={{fontWeight: "bold", paddingRight: 5}} id={'logout'} onClick={fblogout}>{ctx.props.user.user.name}</button>}
        </div>
        <div>
          {ctx.props.user.user.email && <button className={"Button"} id={'logout'} onClick={fblogout}>Logout</button>}
          {!ctx.props.user.user.email && <button className={"Button"} id={'login'} onClick={loginGG}>Login</button>}
        </div>
        <button className={"Button"} onClick={function() {location.reload(true);}}>⭯</button>
      </div>
    </div>)
  }
}

export default connect(state => state)(MenuBar);
