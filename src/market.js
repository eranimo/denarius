// @flow
import Trader from './trader';


export default class Market {
  traders: Array<Trader>;

  constructor() {

  }

  // trades between traders at this market
  simulate() {

  }

  addTrader(trader: Trader) {
    this.traders.push(trader);
  }
}
