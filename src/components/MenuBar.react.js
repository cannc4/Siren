import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';
import './style/MenuBar.css'

import { GitHubLogin, logout, chokeClick, resetClick,
         initTidalConsole, killTidalConsole} from '../actions'

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
      tidalMenu: false,
      boot: 0
    }
  }

  componentDidMount(props,state){
    const ctx = this;
    keymaster('ctrl+space', ctx.toggleClick.bind(ctx));
    keymaster('shift+space', ctx.stopTimer.bind(ctx));
  }

  componentWillUnmount(props, state) {
    const ctx = this;

    keymaster.unbind('ctrl+space', ctx.toggleClick.bind(ctx));
    keymaster.unbind('shift+space', ctx.stopTimer.bind(ctx));
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
      store.dispatch(resetClick());
  }
  ////////////////////////////// TIMER ENDS ////////////////////////////

  runTidal() {
    const ctx=this;
    const { tidalServerLink, tidalMenu, boot } = ctx.state;
    if(boot === 0){
    ctx.setState({tidalMenu:true , boot: 1});
    store.dispatch(initTidalConsole(tidalServerLink));
    
  }
  else{
    ctx.setState({tidalMenu:true});
    console.log(ctx.props)
    const sc_exit = "\"" + ctx.props.user.user.config.scd_start + "\"" + ".load;";
    store.dispatch(killTidalConsole(tidalServerLink,sc_exit));
  }
  }

  stopTidal() {
    const ctx=this;
    const { tidalServerLink,tidalMenu,boot } = ctx.state;
    const sc_exit = "s.quit;"
    ctx.setState({tidalMenu:false });
    store.dispatch(killTidalConsole(tidalServerLink,sc_exit));
  }

  render() {
    const ctx = this;

    const { times ,tidalMenu} = ctx.state;
    const { tidal, click } = ctx.props;
    const { version } = ctx.props.menu;

    console.log(ctx.props.tidal.config)
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

    return (<div className='MenuBar boxshadow'>
      <div>
        <h1 className={"Logo"}>siren<span className={'Version'}>{'('+version+')'}</span></h1>
      </div>
      <div style={{display: 'flex', flexDirection: 'row', height: 40}}>
        {!tidalMenu && <button className={'Button draggableCancel'} onClick={ctx.runTidal.bind(ctx)}>Start Server</button>}
        {tidalMenu && <button className={'Button draggableCancel'} onClick={ctx.stopTidal.bind(ctx)}>Stop Server</button>}
        <div className={"TimerControls"}>
          {!click.isActive && <img src={require('../assets/play@3x.png')} onClick={ctx.startTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
          {click.isActive && <img src={require('../assets/stop@3x.png')} onClick={ctx.stopTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
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
      </div>
    </div>)
  }
}

export default connect(state => state)(MenuBar);
