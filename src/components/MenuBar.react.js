import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import store from '../store';
import './MenuBar.css'

class MenuBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      path: location.pathname,
      paths: [ {
        name: 'Home',
        url: '/'
        },  {
        name: 'Live',
        url:'/live'
      }],
      username: 'vou'
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

  render() {
    const ctx = this;
    const { path, paths } = ctx.state;
    const updatePath = ctx.updatePath.bind(ctx)
    // const loginGG = () => {
    //   store.dispatch(googleLogin())
    // }
    // const fblogout = () => {
    //   store.dispatch(logout())
    // }
    return (<div className='MenuBar boxshadow'>
      <Link className="pullleft" to='/'  onClick={updatePath}>sq</Link>
      {paths.map((p, i) => {
        return <Link key={i} to={p.url} className={'pullright ' + (p.url === path ? 'active' : '')} onClick={updatePath}>{p.name}</Link>
      })}
    </div>)
  }
}
// <div className='Account'>
//   {ctx.props.user.email && <Link to='/' onClick={fblogout}>
//   <i className="icon ion-log-out"/>
// </Link>}
// {!ctx.props.user.email && <Link to='/' onClick={loginGG}>
// <i className="icon ion-log-in"/>
// </Link>}
// </div>


export default connect(state => state)(MenuBar);
