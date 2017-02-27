// @flow
import _ from 'lodash';
import type { Good } from './goods';


// A list of a particular type of historically-relevant economic data
class TradeHistoryItem {
  name: string;
  record: Map<Good, Array<number>>;

  constructor(name: string) {
    this.name = name;
    this.record = new Map();
  }

  register(key: Good) {
    if (!this.record.has(key)) {
      this.record.set(key, []);
    }
  }

  add(key: Good, values: Array<number>) {
    if (isNaN(values[0])) {
      console.trace();
    }
    if (this.record.has(key)) {
      // $FlowFixMe
      const currentArray: Array<number> = this.record.get(key);
      const newArray: Array<number> = currentArray;
      newArray.push(...values);
      this.record.set(key, newArray);
    } else {
      this.record.set(key, values);
    }
  }

  size(key: Good): number {
    if (this.record.has(key)) {
      // $FlowFixMe
      return this.record.get(key).length;
    }
    return 0;
  }

  toString(): string {
    return `TradeHistoryItem(${this.name})`;
  }

  average(key: Good, range: number = 10): number {
    if (this.record.has(key)) {
      const avg: number = _.mean(_.takeRight(this.record.get(key), range));
      return isNaN(avg) ? 0 : avg;
    }
    return 0;
  }

  debug() {
    console.groupCollapsed('TradeHistoryItem');
    for (const [key, value]: [Good, Array<number>] of this.record.entries()) {
      console.log(`${key.key}: ${value.join(', ')}`);
    }
    console.groupEnd('TradeHistoryItem');
  }

}

// a set of data points for the trade simulation
export class TradeHistory {
  prices: TradeHistoryItem;
  numBuyOrders: TradeHistoryItem;
  numSellOrders: TradeHistoryItem;
  unitsTraded: TradeHistoryItem;
  profit: TradeHistoryItem;

  constructor() {
    this.prices = new TradeHistoryItem('prices');
    this.numBuyOrders = new TradeHistoryItem('numBuyOrders');
    this.numSellOrders = new TradeHistoryItem('numSellOrders');
    this.unitsTraded = new TradeHistoryItem('unitsTraded');
    this.profit = new TradeHistoryItem('profit');
  }

  register(item: Good) {
    this.prices.register(item);
    this.numBuyOrders.register(item);
    this.numSellOrders.register(item);
    this.unitsTraded.register(item);
  }
}
