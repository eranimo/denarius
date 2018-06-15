import React, { Component, PropTypes } from 'react';
import { Container } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { forward } from '../actions';
import Controls from './controls';
import Market from './market';
import Trader from './trader';


class Application extends Component {
  static propTypes = {
    forward: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.forward();
  }

  render() {
    if (!window.simulation) {
      return null;
    }

    return (
      <Container>
        <Controls />
        <Switch>
          <Route exact path="/" component={Market} />
          <Route path="/trader/:id" component={Trader} />
          <Route>
            404: Page not found
          </Route>
        </Switch>
      </Container>
    );
  }
}

const mapStateToProps: Function = (state) => {
  return state;
};
const ApplicationContainer: Component = connect(mapStateToProps, { forward })(Application);

export default ApplicationContainer;
