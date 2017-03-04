export function historySelector(state: Object): Object {
  const time: Object = state.time;
  return {
    currentRound: time.currentRound,
    canGoBackward: time.currentRound - 1 > 0,
    canGoForward: true,
    history: time.history ? time.history[time.currentRound] : null
  };
}