// @flow
import Trader from './trader';
import MarketOrder from './marketOrder';
import Simulation from './index';
import type { Good } from './goods';

export default class Market {
  traders: Set<Trader>;
  buyOrders: Set<MarketOrder>;
  sellOrders: Set<MarketOrder>;

  constructor(simulation: Simulation) {
    this.traders = new Set();
    this.buyOrders = new Set();
    this.sellOrders = new Set();
  }

  // resolve all orders by matching sell and buy orders
  resolveOrders() {
    // sort buy orders from highest to lowest price
    // sort sell orders from lowest to highest price
    // match buy_orders[0] with sell_orders[0] until one list is empty
    // for each successful order, remove money from buyer and give it to seller
    // throw out (deny) all other orders
  }

  transferGood(fromTrader: Trader, toTrader: Trader, good: Good, amount: number) {
    if (fromTrader.inventory.hasAmount(good, amount)) {
      toTrader.inventory.subtract(good, amount);
      toTrader.inventory.add(good, amount);
    }
    throw new Error(`Trader ${fromTrader.toString()} doesn't have ${good.displayName} goods`);
  }

  transferMoney(fromTrader: Trader, toTrader: Trader, amount: number) {
    if (fromTrader.money <= amount) {
      fromTrader.money -= amount;
      toTrader.money += amount;
    }
    throw new Error(`Trader ${fromTrader.toString()} doesn't have ${amount} money`);
  }

  addTrader(trader: Trader) {
    trader.market = this;
    this.traders.add(trader);
  }

  removeTrader(trader: Trader) {
    trader.market = undefined;
    this.traders.delete(trader);
  }
}
