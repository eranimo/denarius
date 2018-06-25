import React, { Component } from 'react';
import {
  Navbar,
  Button,
  ButtonGroup,
  ControlGroup,
  Alignment,
} from '@blueprintjs/core';
import { NavLink, withRouter } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { historySelector } from '../selectors';
import * as ACTIONS from '../actions';
import { RootState, Moment } from '../types';


type ControlProps = Moment & {
  reset: () => void,
  forward: () => void,
  backward: () => void,
  goToRound: (round: number) => void,
}

class Controls extends Component<ControlProps> {
  render() {
    const {
      currentRound,
      lastRound,
      reset,
      forward,
      backward,
      goToRound,
      canGoBackward,
      canGoForward
    }: {
      currentRound: number,
      lastRound: number,
      reset: Function,
      forward: Function,
      backward: Function,
      goToRound: Function,
      canGoBackward: boolean,
      canGoForward: boolean
    } = this.props;

    function jumpForward(num: number): Function {
      return () => {
        for (let i: number = 0; i < num; i++) {
          forward();
        }
      };
    }

    return (
      <Navbar fixedToTop>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            Denarius
          </Navbar.Heading>
          <Navbar.Divider />
          <NavLink className="pt-button pt-minimal pt-icon-home" activeClassName="pt-intent-primary" to="/" exact>
            Market
          </NavLink>
          <NavLink className="pt-button pt-minimal pt-icon-home" activeClassName="pt-intent-primary" to="/foo">
            Foo
          </NavLink>
          <NavLink className="pt-button pt-minimal pt-icon-home" activeClassName="pt-intent-primary" to="/bar">
            Bar
          </NavLink>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <ButtonGroup
            style={{ marginRight: '1rem' }}
          >
            <Button
              icon="refresh"
              minimal
              onClick={() => {
                reset();
                forward();
              }}
            />
            <Button
              icon="calendar"
              minimal
              onClick={() => {
                const num: number = parseInt(window.prompt('Enter round to go to'), 10);
                goToRound(num);
              }}
            />
          </ButtonGroup>
          <ControlGroup
            style={{ marginRight: '1rem' }}
          >
            <Button
              minimal
              icon="fast-backward"
              disabled={!canGoBackward}
              onClick={() => backward()}
            />
            <div
              className="pt-button pt-minimal"
              style={{ width: '4rem', textAlign: 'center' }}
            >
              {`${currentRound} / ${lastRound}`}
            </div>
            <Button
              minimal
              icon="fast-forward"
              disabled={!canGoForward}
              onClick={() => forward()}
            />
          </ControlGroup>
          <ButtonGroup>
            <Button
              minimal
              disabled={!canGoForward}
              onClick={() => jumpForward(10)()}
            >
              x10
            </Button>
            <Button
              minimal
              disabled={!canGoForward}
              onClick={() => jumpForward(25)()}
            >
              x25
            </Button>
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
    );
  }
}
const mapStateToProps = (state: RootState): Moment => historySelector(state);
const mapDispatchToProps = (dispatch: Dispatch) => ({
  backward: () => dispatch(ACTIONS.backward()),
  forward: () => dispatch(ACTIONS.forward()),
  reset: () => dispatch(ACTIONS.reset()),
  goToRound: (round: number) => dispatch(ACTIONS.goToRound(round)),
});
const ControlsConnect = withRouter<any>(connect(mapStateToProps, mapDispatchToProps)(Controls));

export default ControlsConnect;
