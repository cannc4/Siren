import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import store from '../store';
import './MenuBar.css'

import { GitHubLogin, logout, chokeClick,resetClick, initTidalConsole} from '../actions'

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
      times: 1
    }
  }
  componentDidUpdate() {
    const ctx = this;
    if (ctx.state.path !== location.pathname){
      ctx.setState({ path: location.pathname })
    }
  }

  ////////////////////////////// TIMER STARTS ////////////////////////////
  startTimer() {
    const ctx = this;
    store.dispatch(chokeClick());
  }

  stopTimer = event =>{
    const ctx = this;
    console.log(event);
    console.log(event.shiftKey);
    console.log(event.ctrlKey);

    if(event.shiftKey)
      store.dispatch(resetClick());
    else
      store.dispatch(chokeClick());
  }
  ////////////////////////////// TIMER ENDS ////////////////////////////

  runTidal() {
    const ctx=this;
    const { tidalServerLink } = ctx.state;
    store.dispatch(initTidalConsole(tidalServerLink));
  }

  render() {
    const ctx = this;

    const { times } = ctx.state;
    const { tidal, click, patterns } = ctx.props;
    const { version } = ctx.props.menu;


    const changeTimes = ({target: {value}}) => {
      if (!isNaN(parseInt(value))){
        ctx.setState({times : parseInt(value)});
        ctx.props.click.times = parseInt(value);
      }
    }

    const loginGG = () => {
      store.dispatch(GitHubLogin())
    }
    const fblogout = () => {
      ctx.setState({username: ''});
      store.dispatch(logout())
    }

    return (<div className='MenuBar boxshadow'>
      <a href={"https://github.com/cannc4/Siren"}>
        σειρήνα
      </a>
      <a href={"https://github.com/cannc4/Siren"}>{version}</a>
      <div className={"User"}>
      &nbsp;&nbsp;&nbsp;
        <div>
          {ctx.props.user.user.email && <button id={'logout'} onClick={fblogout}>{ctx.props.user.user.name}</button>}
        </div>
        <div>
          {ctx.props.user.user.email && <button id={'logout'} onClick={fblogout}>Logout</button>}
          {!ctx.props.user.user.email && <button id={'login'} onClick={loginGG}>Login</button>}
        </div>
      </div>
      <div className={"TimerControls"}>
        {!tidal.isActive && <img src={require('../assets/sc@2x.png')} onClick={ctx.runTidal.bind(ctx)} role="presentation" height={32} width={32}/>}
        {tidal.isActive && <img src={require('../assets/sc_running@2x.png')} role="presentation" height={32} width={32}/>}
        {!click.isActive && <img src={require('../assets/play@3x.png')} onClick={ctx.startTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
        {click.isActive && <img src={require('../assets/stop@3x.png')} onClick={ctx.stopTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
        <p>  Rate&nbsp;&nbsp;  </p>
        <input className={'TimesInput'} value={times} onChange={changeTimes}/>
      </div>
    </div>)
  }
}

export default connect(state => state)(MenuBar);
