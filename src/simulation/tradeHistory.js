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
  num_buy_orders: TradeHistoryItem;
  num_sell_orders: TradeHistoryItem;
  num_trades: TradeHistoryItem;
  profit: TradeHistoryItem;

  constructor() {
    this.prices = new TradeHistoryItem('prices');
    this.num_buy_orders = new TradeHistoryItem('num_buy_orders');
    this.num_sell_orders = new TradeHistoryItem('num_sell_orders');
    this.num_trades = new TradeHistoryItem('num_trades');
    this.profit = new TradeHistoryItem('profit');
  }

  register(item: any) {
    this.prices.register(item);
    this.num_buy_orders.register(item);
    this.num_sell_orders.register(item);
    this.num_trades.register(item);
    this.profit.register(item);
  }
}
