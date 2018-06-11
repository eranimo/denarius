import { createSelector } from 'reselect';
import { History } from '../simulation/index';
import { Good } from '../simulation/goods';
import { GOODS } from '../simulation/goods';
import _ from 'lodash';


const timeSelector: Function = (state) => state.time;
const roundSelector: Function = (roundsBack: number): Function => createSelector(
  timeSelector,
  (time)<number, History> => {
    const currentRound: number = time.currentRound;
    const rounds: Array<number> = _.take(_.rangeRight(0, currentRound + 1), roundsBack)
      .reverse()
      .filter((i: number): boolean => i > 0);
    const history: Array<History> = [];
    for (const round: number of rounds) {
      history.push(time.history[round]);
    }
    return history;
  }
);

export const historySelector: Function = createSelector(
  timeSelector,
  (time) => {
    return {
      lastRound: time.lastRound,
      currentRound: time.currentRound,
      canGoBackward: time.currentRound - 1 > 0,
      canGoForward: true,
      history: time.history ? time.history[time.currentRound] : null
    };
  }
);

export type MoneyRecord = {
  round: number,
  money: number,
  liabilities: number
};

export const historicalTraderMoneySelector: Function = (traderId: number, roundsBack: number): Function => createSelector(
  timeSelector,
  roundSelector(roundsBack),
  (time, rounds: Array<History>): Array<MoneyRecord> => {
    const records: Array<MoneyRecord> = [];
    for (const history: History of rounds) {
      const trader = _.find(history.traders, ['id', parseInt(traderId, 10)]);
      records.push({
        round: history.round,
        money: trader.money,
        liabilities: trader.liabilities
      });
    }
    return records;
  }
);

export type GoodPriceRecord = {
  round: number,
  meanPrice: number,
  supply: number,
  demand: number
};

export const historicalGoodPriceSelector: Function = (roundsBack: number): Function => createSelector(
  timeSelector,
  roundSelector(roundsBack),
  (time, rounds: Array<History>): Map<Good, Array<GoodPriceRecord>> => {
    const records: Map<Good, Array<GoodPriceRecord>> = new Map();
    for (const good: Good of GOODS) {
      const items: Array<GoodPriceRecord> = [];
      for (const history: History of rounds) {
        items.push({
          round: history.round,
          ...history.goodPrices.get(good)
        });
      }
      records.set(good, items);
    }
    return records;
  }
);
