import { createSelector } from 'reselect';
import History from '../simulation/history';
import { Good } from '../simulation/goods';
import { GOODS } from '../simulation/goods';
import _ from 'lodash';
import { TimeState, Moment } from './types';


const timeSelector = (state): TimeState => state.time;
const roundSelector = (roundsBack: number) => createSelector(
  timeSelector,
  (time: TimeState): History[] => {
    const currentRound: number = time.currentRound;
    const rounds: Array<number> = _.take(_.rangeRight(0, currentRound + 1), roundsBack)
      .reverse()
      .filter((i: number): boolean => i > 0);
    const history: Array<History> = [];
    for (const round of rounds) {
      history.push(time.history[round]);
    }
    return history;
  }
);

export const historySelector: Function = createSelector(
  timeSelector,
  (time: TimeState): Moment => {
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

export const historicalTraderMoneySelector = (traderId: number, roundsBack: number) => createSelector(
  roundSelector(roundsBack),
  (rounds: Array<History>): Array<MoneyRecord> => {
    const records: Array<MoneyRecord> = [];
    for (const history of rounds) {
      const trader = _.find(history.traders, ['id', traderId]);
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

export const historicalGoodPriceSelector = (roundsBack: number) => createSelector(
  roundSelector(roundsBack),
  (rounds: History[]): Map<Good, GoodPriceRecord[]> => {
    const records: Map<Good, GoodPriceRecord[]> = new Map();
    for (const good of GOODS) {
      const items: Array<GoodPriceRecord> = [];
      for (const history of rounds) {
        items.push({
          round: history.round,
          ...history.market.goodPrices.get(good)
        });
      }
      records.set(good, items);
    }
    return records;
  }
);
