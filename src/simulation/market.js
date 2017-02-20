// @flow
import Trader from './trader';
import MarketOrder from './marketOrder';
import Simulation from './index';
import { GOODS } from './goods';
import type { Good } from './goods';
import _ from 'lodash';


export default class Market {
  traders: Set<Trader>;
  buyOrders: Map<Good, Set<MarketOrder>>;
  sellOrders: Map<Good, Set<MarketOrder>>;

  constructor(simulation: Simulation) {
    this.traders = new Set();
    this.buyOrders = new Map();
    this.sellOrders = new Map();

    for (const good: Good of GOODS) {
      this.buyOrders.set(good, new Set());
    }

    for (const good: Good of GOODS) {
      this.sellOrders.set(good, new Set());
    }
  }

  // resolve all orders by matching sell and buy orders
  resolveOrders() {
    for (const good: Good of GOODS) {
      const buyOrders: ?Set<MarketOrder> = this.buyOrders.get(good);
      const sellOrders: ?Set<MarketOrder> = this.sellOrders.get(good);

      if (!buyOrders || !sellOrders) {
        return;
      }

      // sort buy orders from highest to lowest price
      const sortedBuyOrders: Array<MarketOrder> = _.sortBy(buyOrders.values(), ['price'], ['DESC']);
      // sort sell orders from lowest to highest price
      const sortedSellOrders: Array<MarketOrder> = _.sortBy(sellOrders.values(), ['price'], ['ASC']);
      // match buy_orders[0] with sell_orders[0] until one list is empty
      while(sortedBuyOrders.length > 0 && sortedSellOrders.length > 0) {
        const buyOrder: MarketOrder = sortedBuyOrders[0];
        const sellOrder: MarketOrder = sortedSellOrders[0];
        const clearingPrice: number = (buyOrder.price + sellOrder.price) / 2;
        const goodsTraded: number = Math.min(buyOrder.amount, sellOrder.amount);


        this.transferGood(sellOrder.trader, buyOrder.trader, buyOrder.good, goodsTraded);
        // remove money from buyer and give it to seller
        this.transferMoney(sellOrder.trader, buyOrder.trader, clearingPrice);

        buyOrder.amount = buyOrder.amount - goodsTraded;
        sellOrder.amount = sellOrder.amount - goodsTraded;


        // throw out (deny) all other orders
        if (buyOrder.amount === 0) {
          buyOrders.delete(buyOrder);
        }

        if (sellOrder.amount === 0) {
          sellOrders.delete(sellOrder);
        }
      }
    }
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
