import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import store from '../store';
import './MenuBar.css'

import { GitHubLogin, logout} from '../actions'

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

    return (<div className='MenuBar boxshadow'>
      <Link className="pullleft" to='/'  onClick={updatePath}>Siren</Link>
      {paths.map((p, i) => {
        return <Link key={i} to={p.url} className={'pullright ' + (p.url === path ? 'active' : '')} onClick={updatePath}>{p.name}</Link>
      })}
    </div>)
  }
}



export default connect(state => state)(MenuBar);
