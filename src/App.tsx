import React, { Suspense } from 'react';
import { hot } from 'react-hot-loader';
import { Switch, Route, Redirect } from 'react-router-dom';

import Navigation from './components/Navigation';

import { useTheme } from '@mui/material/styles';
import Player from './components/Player';
import AudioElement from './components/AudioElement';

import Settings from './views/Settings';
import StatusMessage from './components/StatusMessage';
import Debug from './views/Debug';
import { Loader } from './components/Loader';

const Recorder = React.lazy(() =>
  import(/* webpackChunkName: "recorder" */ './views/Recorder')
);
// const Settings = React.lazy(() => import(/* webpackChunkName: "settings" */ './views/Settings'))
const Library = React.lazy(() =>
  import(/* webpackChunkName: "library" */ './views/Library')
);
const RecordingDetail = React.lazy(() =>
  import(/* webpackChunkName: "recordingDetail" */ './views/RecordingDetail')
);

function App() {
  const theme = useTheme();

  return (
    <div className="main">
      <nav>
        <Navigation />
      </nav>
      <main style={{ paddingTop: theme.dimensions.Navigation.height }}>
        <Suspense
          fallback={<Loader loading={true} loadingMessage="Loading..." />}
        >
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
            <Route path="/debug">
              <Debug />
            </Route>
            <Route exact path="/">
              <Redirect to="/recorder" />
            </Route>
          </Switch>
        </Suspense>
      </main>
      <Player />
      <AudioElement />
      <StatusMessage />
    </div>
  );
}

export default hot(module)(App);
