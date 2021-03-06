import type { History } from '../simulation/index';
import { FORWARD, BACKWARD, RESET, GO_TO_ROUND } from './actions';


const initialState: Object = {
  history: {},
  lastRound: 0,
  currentRound: 0
};

export function time(state: Object = initialState, action: Object): Object {
  if (action.type === FORWARD) {
    if (state.currentRound + 1 > state.lastRound) {
      const history: History = window.simulation.nextRound();
      return {
        ...state,
        history: {
          ...state.history,
          [history.round]: history
        },
        lastRound: history.round,
        currentRound: state.currentRound + 1
      };
    } else {
      return {
        ...state,
        currentRound: state.currentRound + 1
      };
    }
  } else if (action.type === BACKWARD) {
    if (state.currentRound - 1 > 0) {
      return {
        ...state,
        currentRound: state.currentRound - 1
      };
    } else {
      throw Error('Cannot go backwards before round 1');
    }
  } else if (action.type === GO_TO_ROUND) {
    if (action.payload.round <= state.lastRound && action.payload.round > 0) {
      return {
        ...state,
        currentRound: action.payload.round
      };
    } else {
      return state;
    }
  } else if (action.type === RESET) {
    window.simulation.reset();
    return initialState;
  } else {
    return state;
  }
}
