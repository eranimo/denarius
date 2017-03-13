import React, { Component, PropTypes } from 'react';
import { Menu, Header, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { historySelector } from '../selectors';
import { forward, backward, reset } from '../actions';


class Controls extends Component {
  static propTypes = {
    currentRound: PropTypes.number.isRequired,
    canGoBackward: PropTypes.bool.isRequired,
    canGoForward: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    forward: PropTypes.func.isRequired,
    backward: PropTypes.func.isRequired,
  }

  render(): Object {
    const {
      currentRound,
      reset,
      forward,
      backward,
      canGoBackward,
      canGoForward
    }: {
      currentRound: number,
      reset: Function,
      forward: Function,
      backward: Function,
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
      <div>
        <Header as="h1">
          Denarius
        </Header>
        <Menu pointing>
          <NavLink className="item" activeClassName="active" to="/" exact>
            Market
          </NavLink>
          <Menu.Menu position="right">
            <Menu.Item>
              <Button
                basic
                icon="refresh"
                compact
                onClick={() => {
                  reset();
                  forward();
                }}
              />
            </Menu.Item>
            <Menu.Item>
              <Button
                basic
                icon="backward"
                compact
                disabled={!canGoBackward}
                onClick={backward}
              />
            </Menu.Item>

            <Menu.Item>
              {currentRound}
            </Menu.Item>

            <Menu.Item>
              <Button
                basic
                icon="forward"
                compact
                disabled={!canGoForward}
                onClick={forward}
              />
            </Menu.Item>

            <Menu.Item>
              <Button.Group basic compact>
                <Button
                  style={{fontWeight: 'bold'}}
                  disabled={!canGoForward}
                  onClick={jumpForward(10)}
                >
                  x10
                </Button>
                <Button
                  style={{fontWeight: 'bold'}}
                  disabled={!canGoForward}
                  onClick={jumpForward(25)}
                >
                  x25
                </Button>
              </Button.Group>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    );
  }
}
const mapStateToProps: Function = historySelector;
const mapDispatchToProps: Object = { backward, forward, reset };
const ControlsConnect: Object = connect(mapStateToProps, mapDispatchToProps)(Controls);

export default ControlsConnect;
