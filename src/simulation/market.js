// @flow
import Trader from './trader';


export default class Market {
  traders: Array<Trader>;

  constructor() {
    this.traders = [];
  }

  // trades between traders at this market
  resolveOrders() {

  }

  addTrader(trader: Trader) {
    this.traders.push(trader);
  }
}
