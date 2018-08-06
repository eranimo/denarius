import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './main.css';
import { ISimRuntime } from '../worldgen/types';


export default function setupInterface(runtime: ISimRuntime) {
  const app = <App runtime={runtime} />;
  ReactDOM.render(app, document.querySelector('main.app'));
}
