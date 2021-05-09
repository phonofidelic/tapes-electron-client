import React from 'react';
import { hot } from 'react-hot-loader';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from 'react-router-dom';
import Recorder from './views/Recorder';
import Settings from './views/Settings';
import Storage from './views/Storage';
import Navigation from './components/Navigation';
import { useTheme } from '@material-ui/core/styles';

function App() {
  const theme = useTheme();
  const location = useLocation();
  console.log('location:', location);

  return (
    <div className="main">
      <nav>
        <Navigation />
      </nav>
      <main style={{ paddingTop: theme.dimensions.Navigation.height }}>
        <Switch>
          <Route path="/storage">
            <Storage />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route path="/recorder">
            <Recorder />
          </Route>
          <Route exact path="/main_window">
            <Redirect to="/recorder" />
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default hot(module)(App);
