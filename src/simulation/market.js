// @flow
import Trader from './trader';
import MarketOrder from './marketOrder';


export default class Market {
  traders: Array<Trader>;
  buyOrders: Array<MarketOrder>;
  sellOrders: Array<MarketOrder>;

  constructor() {
    this.traders = [];
  }

  // trades between traders at this market
  resolveOrders() {
    // for each trade:
    // sort buy orders from highest to lowest price
    // sort sell orders from lowest to highest price
    // match buy_orders[0] with sell_orders[0] until one list is empty
    // for each successful order, remove money from buyer and give it to seller
    // throw out (deny) all other orders
  }

  addTrader(trader: Trader) {
    this.traders.push(trader);
  }
}
