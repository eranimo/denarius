import { createAction } from 'typesafe-actions';


export const FORWARD: string = 'FORWARD';
export const BACKWARD: string = 'BACKWARD';
export const RESET: string = 'RESET';
export const GO_TO_ROUND: string = 'GO_TO_ROUND';

export const forward = createAction(FORWARD)<void>();
export const backward = createAction(BACKWARD)<void>();
export const reset = createAction(RESET)<void>();
export const goToRound = createAction(RESET)<number>();
