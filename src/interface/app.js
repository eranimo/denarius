import React, { Component, PropTypes } from 'react';
import { Container } from 'semantic-ui-react';
import Market from './market';
import Trader from './trader';
import { connect } from 'react-redux';
import { forward } from './actions';
import { Switch, Route } from 'react-router-dom';
import Controls from './controls';


class Application extends Component {
  static propTypes = {
    forward: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.forward();
  }

  render(): Object {
    if (!window.simulation) {
      return null;
    }

    return (
      <Container>
        <Controls />
        <Switch>
          <Route exact path="/" component={Market}>
            <Route path="/trader/:id" component={Trader} />
          </Route>
          <Route>
            404: Page not found
          </Route>
        </Switch>
      </Container>
    );
  }
}

const mapStateToProps: Function = (state: Object): Object => {
  return state;
};
const ApplicationContainer: Component = connect(mapStateToProps, { forward })(Application);

export default ApplicationContainer;