// @flow
import React, { Component } from 'react';
import { Statistic, Icon } from 'semantic-ui-react';


export default class Trader extends Component {

  render(): Object {
    const history: Object = window.simulation.history[0];
    return (
      <div>
        History
      </div>
    );
  }
}