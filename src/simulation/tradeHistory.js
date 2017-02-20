// @flow
import _ from 'lodash';


// A list of a particular type of historically-relevant economic data
class TradeHistoryItem {
  name: string;
  record: Object;

  constructor(name: string) {
    this.name = name;
    this.record = {};
  }

  register(key: any) {
    if (!(key in this.record)) {
      this.record[key] = [];
    }
  }

  add(key: any, ...value: any) {
    this.record[key].push(...value);
  }

  toString(): string {
    return `TradeHistoryItem(${this.name})`;
  }

  average(key: any, range: number = 10): number {
    if (key in this.record) {
      return _.mean(_.takeRight(this.record[key], range));
    }
    return 0;
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

  register(item: any) {
    this.prices.register(item);
    this.numBuyOrders.register(item);
    this.numSellOrders.register(item);
    this.unitsTraded.register(item);
    this.profit.register(item);
  }
}
