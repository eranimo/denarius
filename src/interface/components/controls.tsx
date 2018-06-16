import React, { Component } from 'react';
import {
  Navbar,
  Button,
  Alignment,
} from '@blueprintjs/core';
import { NavLink } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { historySelector } from '../selectors';
import { forward, backward, reset, goToRound } from '../actions';
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
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            Denarius
          </Navbar.Heading>
          <Navbar.Divider />
          <Button minimal>
            <NavLink className="item" activeClassName="active" to="/" exact>
              Market
            </NavLink>
          </Button>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button
            icon="refresh"
            onClick={() => {
              reset();
              forward();
            }}
          />
          <Button
            icon="calendar"
            onClick={() => {
              const num: number = parseInt(window.prompt('Enter round to go to'), 10);
              goToRound(num);
            }}
          />
          <Button
            icon="fast-backward"
            disabled={!canGoBackward}
            onClick={() => backward()}
          />
          <span>{currentRound} / {lastRound}</span>
          <Button
            icon="fast-forward"
            disabled={!canGoForward}
            onClick={() => forward()}
          />
          <Button
            style={{ fontWeight: 'bold' }}
            disabled={!canGoForward}
            onClick={() => jumpForward(10)}
          >
            x10
          </Button>
          <Button
            style={{ fontWeight: 'bold' }}
            disabled={!canGoForward}
            onClick={() => jumpForward(25)}
          >
            x25
          </Button>
        </Navbar.Group>
      </Navbar>
    );
  }
}
const mapStateToProps = (state: RootState): Moment => historySelector(state);
const mapDispatchToProps = (dispatch: Dispatch) => ({
  backward: () => dispatch(backward()),
  forward: () => dispatch(forward()),
  reset: () => dispatch(reset()),
  goToRound: (round: number) => dispatch(goToRound(round)),
});
const ControlsConnect = connect(mapStateToProps, mapDispatchToProps)(Controls);

export default ControlsConnect;
