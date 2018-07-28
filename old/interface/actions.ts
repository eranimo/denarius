import { createStandardAction } from 'typesafe-actions';


export const FORWARD: string = 'FORWARD';
export const BACKWARD: string = 'BACKWARD';
export const RESET: string = 'RESET';
export const GO_TO_ROUND: string = 'GO_TO_ROUND';

export const forward = createStandardAction(FORWARD)<void>();
export const backward = createStandardAction(BACKWARD)<void>();
export const reset = createStandardAction(RESET)<void>();
export const goToRound = createStandardAction(RESET)<number>();
