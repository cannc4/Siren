import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

// import { fetchPlayer } from '../actions';
import store from '../store';
import App from '../components/App';

// import Accounts from '../components/Accounts.react';
// import CableSections from '../components/CableSections.react';
// import Categories from '../components/Categories.react';

import Commands from '../components/Commands.react';
import Live from '../components/Live.react';
import Home from '../components/Home.react';

import {
  handleEnterHome,
  handleEnterLive
} from './callbacks';

export default (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} onEnter={handleEnterHome}>
        <IndexRoute component={Home}/>
        <Route
          path="/commands"
          component={Commands}
        />
        </Route>
        <Route path="/live" component={App} onEnter={handleEnterLive}>
      <IndexRoute component={Live}/>
      <Route
        path="/commands"
        component={Commands}
      />
    </Route>
    </Router>
  </Provider>
)


// <Route
//   path="/categories"
//   component={Categories}
// />

// <Route
//   path="/cablesections"
//   component={CableSections}
// />
