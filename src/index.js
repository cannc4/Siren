import ReactDOM from 'react-dom';
import promiseFinally from 'promise.prototype.finally';
import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';

import './index.css';

import Home from './components/Home';
import MenuBar from './components/MenuBar';

import cellStore from './stores/cellStore';
import channelStore from './stores/channelStore';
import consoleStore from './stores/consoleStore';
import debugStore from './stores/debugStore';
import globalStore from './stores/globalStore';
import historyStore from './stores/historyStore';
import layoutStore from './stores/layoutStore';
import menubarStore from './stores/menubarStore';
import nanoStore from './stores/nanoStore';
import pathStore from './stores/pathStore';
import patternStore from './stores/patternStore';
import pulseStore from './stores/pulseStore';
import rollStore from './stores/rollStore';
import sceneStore from './stores/sceneStore';

const stores = {
  layoutStore,
  patternStore,
  channelStore,
  consoleStore,
  sceneStore,
  menubarStore,
  pulseStore,
  pathStore,
  rollStore,
  historyStore,
  globalStore,
  cellStore,
  nanoStore,
  debugStore
};

// For easier debugging
window.SIREN = stores;

promiseFinally.shim();
useStrict(false);

ReactDOM.render((
  <Provider {...stores}>
    <HashRouter>
      <div>
        <Route component={MenuBar} />
        <Route component={Home} />
      </div>
    </HashRouter>
  </Provider>
), document.getElementById('root'));