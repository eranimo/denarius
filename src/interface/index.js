import { combineReducers } from 'redux';
import * as reducers from './reducers';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import Application from './components/app';


export default function setup() {
  const appReducer: Object = combineReducers(reducers);
  const store: Object = createStore(
    appReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  const app: Object = (
    <Provider store={store}>
      <BrowserRouter>
        <Application />
      </BrowserRouter>
    </Provider>
  );
  ReactDOM.render(app, document.querySelector('main.app'));
}
