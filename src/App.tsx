import React, { useEffect } from 'react';
import { hot } from 'react-hot-loader';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { initDatabase } from './effects';
import Recorder from './views/Recorder';
import Settings from './views/Settings';
import Library from './views/Library';
import RecordingDetail from './views/RecordingDetail';
import Navigation from './components/Navigation';

import { useTheme } from '@material-ui/core/styles';
import Player from './components/Player';

function App() {
  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initDatabase());
  }, []);

  return (
    <div className="main">
      <nav>
        <Navigation />
      </nav>
      <main style={{ paddingTop: theme.dimensions.Navigation.height }}>
        <Switch>
          <Route path="/library/:id">
            <RecordingDetail />
          </Route>
          <Route path="/library">
            <Library />
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
      <Player />
      <audio id="audio-player">
        <source id="audio-source" />
      </audio>
    </div>
  );
}

export default hot(module)(App);
