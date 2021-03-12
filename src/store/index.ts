import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk, { ThunkAction } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { reducer, initialState } from './reducer';

export type RootState = ReturnType<typeof reducer>;

const composeEnhancers = composeWithDevTools({});
const enhancer = composeEnhancers(applyMiddleware(reduxThunk));

export const store = createStore(reducer, initialState, enhancer);
