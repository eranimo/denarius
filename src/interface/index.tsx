import { combineReducers } from 'redux';
import * as reducers from './reducers';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import Application from './components/app';
import './main.css';


export default function setup() {
  const appReducer = combineReducers(reducers);
  const store = createStore(
    appReducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  );

  const app = (
    <Provider store={store}>
      <BrowserRouter>
        <Application />
      </BrowserRouter>
    </Provider>
  );
  ReactDOM.render(app, document.querySelector('main.app'));
}
