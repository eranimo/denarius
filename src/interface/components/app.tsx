import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { forward } from '../actions';
import Controls from './controls';
import Market from './market';
import Trader from './trader';


class Application extends Component<{
  forward: () => any
}> {
  componentDidMount() {
    this.props.forward();
  }

  render() {
    if (!(window as any).simulation) {
      return null;
    }

    return (
      <div>
        <Controls />
        <Switch>
          <Route exact path="/" component={Market} />
          <Route path="/trader/:id" component={Trader} />
          <Route>
            404: Page not found
          </Route>
        </Switch>
      </div>
    );
  }
}
const mapStateToDispatch = (dispatch: Dispatch) => ({
  forward: () => dispatch(forward()),
})
const ApplicationContainer = connect(null, mapStateToDispatch)(Application);

export default ApplicationContainer;
