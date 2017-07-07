import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import store from '../store';
import './MenuBar.css'

import { GitHubLogin, logout, chokeClick, initMyTidal} from '../actions'

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
    }
  }
  componentDidUpdate() {
    const ctx = this;
    if (ctx.state.path !== location.pathname){
      ctx.setState({ path: location.pathname })
    }
  }

  updatePath(path) {
    const ctx = this;
    ctx.setState({ path })
  }

  ////////////////////////////// TIMER STARTS ////////////////////////////
  startTimer() {
    const ctx = this;
    store.dispatch(chokeClick());
  }

  stopTimer() {
    const ctx = this;
    store.dispatch(chokeClick());
  }
  ////////////////////////////// TIMER ENDS ////////////////////////////

  runTidal() {
    const ctx=this;
    const { tidalServerLink } = ctx.state;
    store.dispatch(initMyTidal(tidalServerLink));
  }

  render() {
    const ctx = this;
    const { path, paths } = ctx.state;
    const updatePath = ctx.updatePath.bind(ctx)

    const { tidal, click, patterns } = ctx.props;
    const { version } = ctx.props.menu;

    const loginGG = () => {
      store.dispatch(GitHubLogin())
    }
    const fblogout = () => {
      ctx.setState({username: ''});
      store.dispatch(logout())
    }

    console.log('MENUBAR ', ctx.props);

    return (<div className='MenuBar boxshadow'>
      <Link className="pullleft" to='https://github.com/cannc4/Siren'  onClick={updatePath}>σειρήνα -- {version}</Link>

      <div className="User">
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'right'}}>
          {ctx.props.user.user.email && <button className={'buttonSentinel'} id={'logout'} onClick={fblogout}>Logout</button>}
          {!ctx.props.user.user.email && <button className={'buttonSentinel'} id={'login'} onClick={loginGG}>Login</button>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'right'}}>
          {ctx.props.user.user.email && <button className={'buttonSentinel'} id={'logout'} onClick={fblogout}>{ctx.props.user.user.name}</button>}
        </div>
      </div>

      <div className={"TimerControls"}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
         {!tidal.isActive && <img src={require('../assets/sc@2x.png')} onClick={ctx.runTidal.bind(ctx)} role="presentation" height={32} width={32}/>}
         {tidal.isActive && <img src={require('../assets/sc_running@2x.png')} role="presentation" height={32} width={32}/>}
         {!click.isActive && <img src={require('../assets/play@3x.png')} onClick={ctx.startTimer.bind(ctx)} role="presentation" height={32} width={32}/>}
         {click.isActive && <div> <img src={require('../assets/stop@3x.png')} onClick={ctx.stopTimer.bind(ctx)} role="presentation" height={32} width={32}/> </div>}
        </div>
      </div>
    </div>)
  }
}

export default connect(state => state)(MenuBar);
