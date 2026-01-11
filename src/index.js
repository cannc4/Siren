import React from 'react';
import { createRoot } from 'react-dom/client';
import promiseFinally from 'promise.prototype.finally';
import { HashRouter } from 'react-router-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';

import './index.css';

import App from './components/App';

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
import setupStore from './stores/setupStore';

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
  debugStore,
  setupStore
};

// For easier debugging
window.SIREN = stores;

promiseFinally.shim();

// MobX 6 configuration (replaces deprecated useStrict)
configure({
  enforceActions: 'never',
  useProxies: 'ifavailable'
});

// React 18 createRoot API
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider {...stores}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
);
