import React, { useEffect, Suspense } from 'react';
import { hot } from 'react-hot-loader';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import effects from './effects';
// import Recorder from './views/Recorder';
// import Settings from './views/Settings';
// import Library from './views/Library';
// import RecordingDetail from './views/RecordingDetail';
import Navigation from './components/Navigation';

import { useTheme } from '@mui/material/styles';
import Player from './components/Player';
import AudioElement from './components/AudioElement';

const Recorder = React.lazy(() => import(/* webpackChunkName: "recorder" */ './views/Recorder'))
const Settings = React.lazy(() => import(/* webpackChunkName: "settings" */ './views/Settings'))
const Library = React.lazy(() => import(/* webpackChunkName: "library" */ './views/Library'))
const RecordingDetail = React.lazy(() => import(/* webpackChunkName: "recordingDetail" */ './views/RecordingDetail'))

const { initDatabase } = effects


function App() {
  const theme = useTheme();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(window.location.search);
  const desktopPeerId = searchParams.get('peerid')

  useEffect(() => {
    dispatch(initDatabase(desktopPeerId));
  }, []);

  return (
    <div className="main">
      <nav>
        <Navigation />
      </nav>
      <main style={{ paddingTop: theme.dimensions.Navigation.height }}>
        <Suspense fallback={<div>Loading...</div>}>
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
            <Route exact path="/">
              <Redirect to="/recorder" />
            </Route>
          </Switch>
        </Suspense>
      </main>
      <Player />
      <AudioElement />
      <audio id="audio-player">
        <source id="audio-source" />
      </audio>
    </div>
  );
}

export default hot(module)(App);
// export default App
