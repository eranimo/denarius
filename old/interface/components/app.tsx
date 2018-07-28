import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { forward } from '../actions';
import Controls from './controls';
import Market from './market';
import Trader from './trader';
import CompanyList from './companyList';


document.body.classList.add('pt-dark');

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
        <main style={{ marginTop: '58px', padding: '1rem' }}>
          <Switch>
            <Route exact path="/" component={Market} />
            <Route path="/companies" component={CompanyList} />
            <Route path="/foo" component={() => <div>Foo</div>} />
            <Route path="/bar" component={() => <div>Bar</div>} />
            <Route path="/trader/:id" component={Trader} />
            <Route>
              404: Page not found
            </Route>
          </Switch>
        </main>
      </div>
    );
  }
}
const mapStateToDispatch = (dispatch: Dispatch) => ({
  forward: () => dispatch(forward()),
})
const ApplicationContainer = withRouter<any>(connect(null, mapStateToDispatch)(Application));

export default ApplicationContainer;
