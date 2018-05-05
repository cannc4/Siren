import ReactDOM from 'react-dom';
import promiseFinally from 'promise.prototype.finally';
import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';

import './index.css';

import Home from './components/Home';
import MenuBar from './components/MenuBar';

import layoutStore from './stores/layoutStore';
import patternStore from './stores/patternStore';
import consoleStore from './stores/consoleStore';
import sceneStore from './stores/sceneStore';
import menubarStore from './stores/menubarStore';
import pulseStore from './stores/pulseStore';
import pathStore from './stores/pathStore';
import channelStore from './stores/channelStore';
import rollStore from './stores/rollStore';
import historyStore from './stores/historyStore';
import globalStore from './stores/globalStore';
import cellStore from './stores/cellStore';
import nanoStore from './stores/nanoStore';
import debugStore from './stores/debugStore';


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

// window.onLoad = function() {
  
// };
// document.addEventListener("DOMContentLoaded", function(event) {
//   console.log("DOM fully loaded and parsed");
//   var x = document.getElementsByTagName("CANVAS");
//   var i;
//   for (i = 0; i < x.length; i++) {
//     console.log(" -> ", x[i]);
//     // x[i].style.backgroundColor = "red";
//   }
// });
// document.addEventListener('readystatechange', () => console.log("SSSSSSSSSSSSSSSS:", document.readyState));
// window.onload = () => { 
//   console.log("DDDDDDDDDDDDD Window is loaded");
//   // modules
//   var x = document.getElementsByClassName('PanelAdjuster');
//   var i;
//   for (i = 0; i < x.length; i++) {
//     console.log(" -> ", x[i]);
//     x[i].addEventListener('visibilitychange', (state) => {
//       console.log(state);
      
//     });
//     // x[i].style.backgroundColor = "red";
//   }
// };

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