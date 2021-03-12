import { hot } from 'react-hot-loader';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Recorder from './views/Recorder';
import Settings from './views/Settings';
import Storage from './views/Storage';
import Navigation from './components/Navigation';

function App() {
  return (
    <div>
      <Navigation />
      <Switch>
        <Route path="/storage">
          <Storage />
        </Route>
        <Route path="/settings">
          <Settings />
        </Route>
        <Route>
          <Recorder />
        </Route>
      </Switch>
    </div>
  );
}

export default hot(module)(App);
