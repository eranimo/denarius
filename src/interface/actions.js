export const FORWARD: string = 'FORWARD';
export const BACKWARD: string = 'BACKWARD';
export const RESET: string = 'RESET';
export const GO_TO_ROUND: string = 'GO_TO_ROUND';


type ReduxAction = {
  type: string
};

export function forward(): ReduxAction {
  return {
    type: FORWARD
  };
}

export function backward(): ReduxAction {
  return {
    type: BACKWARD
  };
}

export function reset(): ReduxAction {
  return {
    type: RESET
  };
}

export function goToRound(round: number): ReduxAction {
  return {
    type: GO_TO_ROUND,
    payload: { round }
  };
}
