import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk, { ThunkAction } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import throttle from 'lodash/throttle';

import { reducer, initialState } from './reducer';
import { RecordingSettings } from '../common/RecordingSettings.interface';

export type RootState = ReturnType<typeof reducer>;

const composeEnhancers = composeWithDevTools({});
const enhancer = composeEnhancers(applyMiddleware(reduxThunk));

/*** Persist state to localStorage ****
 *	From: https://egghead.io/lessons/javascript-redux-persisting-the-state-to-the-local-storage
 */
const STORAGE_VERSION = 1;
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      console.log('savedState not found');
      return undefined;
    }
    const savedState = JSON.parse(serializedState);
    // if (!savedState.version || savedState.version < STORAGE_VERSION) {
    //   console.log('savedState is out of date');
    //   // TODO: Load updated storage object
    //   return undefined;
    // }
    console.log('savedState:', savedState);
    return savedState;
  } catch (err) {
    console.error('could not load savedState:', err);
    return undefined;
  }
};

export const saveState = (state: any) => {
  // console.log('saveState state:', state)
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    console.error('localStorage saveState error:', err);
  }
};
/*********************************************************************************************/

const persistedState =
  { ...initialState, recordingSettings: loadState() } || initialState;

const persistedRecordingSettings: RecordingSettings = loadState() || {
  format: 'mp3',
  channels: 2,
};

const store = createStore(
  reducer,
  { ...initialState, recordingSettings: persistedRecordingSettings },
  enhancer
);

store.subscribe(
  throttle(() => {
    saveState(store.getState().recordingSettings);
  }, 1000)
);

export { store };
