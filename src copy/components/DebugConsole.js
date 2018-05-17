import React from 'react';
import { inject, observer } from 'mobx-react';
// import _ from 'lodash';

// CSS Imports
import '../styles/App.css';
import '../styles/Layout.css';
import '../styles/Home.css';
import '../styles/ContextMenu.css';

@inject ('debugStore')
@observer
export default class DebugConsole extends React.Component {
  render() {
    const ctx = this;
    return (<div className={'DebugConsole PanelAdjuster'}>
      {ctx.props.debugStore.debugLogMessage}
    </div>)
  }  
}
