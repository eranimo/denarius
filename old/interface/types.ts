import History from '../simulation/history';


export type RootState = {
  time: TimeState,
};

export type TimeState = {
  history: {
    [round: number]: History,
  },
  lastRound: number,
  currentRound: number,
};


export type Moment = {
  lastRound: number,
  currentRound: number,
  canGoBackward: boolean,
  canGoForward: boolean,
  history: History | null,
}
