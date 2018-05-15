import React from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

// CSS Imports
import '../styles/_comp.css';
import '../styles/Layout.css';
import '../styles/App.css';
import '../styles/Home.css';
import '../styles/ContextMenu.css';

@inject ('debugStore')
@observer
export default class DebugConsole extends React.Component {
  render() {
    const ctx = this;

    // let message = ctx.props.debugStore.debugLogMessage;
    // console.log(message);
    // if(_.isObject(message)) {
    //   message = JSON.stringify(message);
    // }
    // else {
    //   message = _.toString(message);
    // }
    return (<div className={'DebugConsole'}>
      {ctx.props.debugStore.debugLogMessage}
    </div>)
  }  
}
