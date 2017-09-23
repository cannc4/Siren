import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import store from '../store';
import App from '../components/App';
import Home from '../components/Home.react';
import {
  handleEnterHome
} from './callbacks';

// <Route
//   path="/patterns"
//   component={Patterns}
// />

export default (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} onEnter={handleEnterHome}>
        <IndexRoute component={Home}/>

      </Route>
    </Router>
  </Provider>
)
