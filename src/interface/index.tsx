import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './main.css';


export default function setupInterface() {
  const app = <App />;
  ReactDOM.render(app, document.querySelector('main.app'));
}
