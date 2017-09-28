import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import io from 'socket.io-client';
import _ from 'lodash';
import './style/Home.css'

import { dCon } from '../actions'

class DebugConsole extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    var sockett = io('http://localhost:3004/'); // TIP: io() with no args does auto-discovery

    sockett.on("dcon", data => {
      store.dispatch(dCon(data ));
    })
  }

  render() {
    const ctx = this;

    return (<div className={'DebugConsole'}>
      {_.toString(ctx.props.tidal.debugconsole)}
    </div>)
  }
}

export default connect(state => state)(DebugConsole);
