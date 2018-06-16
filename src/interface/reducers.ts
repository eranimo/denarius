import History from '../simulation/history';
import { FORWARD, BACKWARD, RESET, GO_TO_ROUND } from './actions';
import { TimeState } from './types';


const initialState: TimeState = {
  history: {},
  lastRound: 0,
  currentRound: 0
};

export function time(state = initialState, action): TimeState {
  if (action.type === FORWARD) {
    if (state.currentRound + 1 > state.lastRound) {
      const history: History = (window as any).simulation.nextRound();
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
    if (action.payload <= state.lastRound && action.payload > 0) {
      return {
        ...state,
        currentRound: action.payload
      };
    } else {
      return state;
    }
  } else if (action.type === RESET) {
    (window as any).simulation.reset();
    return initialState;
  } else {
    return state;
  }
}
