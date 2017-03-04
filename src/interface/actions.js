export const FORWARD: string = 'FORWARD';
export const BACKWARD: string = 'BACKWARD';
export const RESET: string = 'RESET';


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