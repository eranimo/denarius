// @flow
import Trader from './trader';
import MarketOrder from './marketOrder';
import { GOODS } from './goods';
import { JOBS } from './jobs';
import type { Good } from './goods';
import type { Job } from './jobs';
import _ from 'lodash';
import { TradeHistory } from './tradeHistory';


export default class Market {
  traders: Set<Trader>;
  buyOrders: Map<Good, Set<MarketOrder>>;
  sellOrders: Map<Good, Set<MarketOrder>>;
  history: TradeHistory;

  constructor() {
    this.traders = new Set();
    this.buyOrders = new Map();
    this.sellOrders = new Map();

    this.history = new TradeHistory();

    for (const good: Good of GOODS) {
      this.buyOrders.set(good, new Set());
      this.sellOrders.set(good, new Set());
      this.history.register(good);

      // make some fake historical data
      this.history.prices.add(good, [1.0]);
      this.history.numBuyOrders.add(good, [1.0]);
      this.history.numSellOrders.add(good, [1.0]);
      this.history.unitsTraded.add(good, [1.0]);
    }
    for (const job: Job of JOBS) {
      this.history.profit.register(job);
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
      const sortedBuyOrders: Array<MarketOrder> = _.sortBy(Array.from(buyOrders), ['price'], ['DESC']);
      // sort sell orders from lowest to highest price
      const sortedSellOrders: Array<MarketOrder> = _.sortBy(Array.from(sellOrders), ['price'], ['ASC']);

      const totalBuyAmount: number = _.sumBy(sortedBuyOrders, 'amount');
      const totalSellAmount: number = _.sumBy(sortedSellOrders, 'amount');

      let moneyTraded: number = 0;
      let unitsTraded: number = 0;

      // match buy_orders[0] with sell_orders[0] until one list is empty
      while(sortedBuyOrders.length > 0 && sortedSellOrders.length > 0) {
        const buyOrder: MarketOrder = sortedBuyOrders[0];
        const sellOrder: MarketOrder = sortedSellOrders[0];
        const clearingPrice: number = (buyOrder.price + sellOrder.price) / 2;
        const goodsTraded: number = Math.min(buyOrder.amount, sellOrder.amount);


        this.transferGood(sellOrder.trader, buyOrder.trader, buyOrder.good, goodsTraded);
        // remove money from buyer and give it to seller
        this.transferMoney(sellOrder.trader, buyOrder.trader, clearingPrice);

        // update metrics
        buyOrder.trader.successfulTrades++;
        sellOrder.trader.successfulTrades++;

        // update price beliefs
        buyOrder.trader.updatePriceBelief(buyOrder.good, buyOrder.orderType, true, clearingPrice);
        sellOrder.trader.updatePriceBelief(sellOrder.good, sellOrder.orderType, true, clearingPrice);

        // change amounts
        buyOrder.amount = buyOrder.amount - goodsTraded;
        sellOrder.amount = sellOrder.amount - goodsTraded;

        // throw out (deny) all other orders
        if (buyOrder.amount === 0) {
          sortedBuyOrders.shift();
        }

        if (sellOrder.amount === 0) {
          sortedSellOrders.shift();
        }

        moneyTraded += clearingPrice;
        unitsTraded += goodsTraded;
      }

      // record failure
      for (const leftoverSellOrder: MarketOrder of sortedSellOrders) {
        leftoverSellOrder.trader.failedTrades++;
        leftoverSellOrder.trader.updatePriceBelief(leftoverSellOrder.good, leftoverSellOrder.orderType, false);
      }

      for (const leftoverBuyOrder: MarketOrder of sortedBuyOrders) {
        leftoverBuyOrder.trader.failedTrades++;
        leftoverBuyOrder.trader.updatePriceBelief(leftoverBuyOrder.good, leftoverBuyOrder.orderType, false);
      }

      // log some stuff for the history books
      this.history.numBuyOrders.add(good, [totalBuyAmount]);
      this.history.numSellOrders.add(good, [totalSellAmount]);
      this.history.unitsTraded.add(good, [unitsTraded]);

      if (unitsTraded > 0) {
        this.history.profit.add(good, [moneyTraded / unitsTraded]);
      } else {
        // no units were traded this round, so use the last round's average price
        this.history.profit.add(good, [this.history.prices.average(good, 1)]);
      }
    }
  }

  // transfer a good from one Trader to another
  transferGood(fromTrader: Trader, toTrader: Trader, good: Good, amount: number) {
    if (fromTrader.inventory.hasAmount(good, amount)) {
      toTrader.inventory.subtract(good, amount);
      toTrader.inventory.add(good, amount);
    } else {
      throw new Error(`Trader ${fromTrader.toString()} doesn't have ${amount} '${good.displayName}' goods (it has ${fromTrader.inventory.get(good)})`);
    }
  }

  // transfer money from one Trader to another
  transferMoney(fromTrader: Trader, toTrader: Trader, amount: number) {
    if (fromTrader.money >= amount) {
      fromTrader.money -= amount;
      toTrader.money += amount;
    } else {
      throw new Error(`Trader ${fromTrader.toString()} doesn't have ${amount} money (it has ${fromTrader.money})`);
    }
  }

  avgHistoricalPrice(good: Good, dayRange: number): number {
    return this.history.prices.average(good, dayRange);
  }

  addTrader(trader: Trader) {
    trader.moveToMarket(this);
    this.traders.add(trader);
  }

  removeTrader(trader: Trader) {
    trader.market = undefined;
    this.traders.delete(trader);
  }

  buy(order: MarketOrder) {
    const buyOrders: ?Set<MarketOrder> = this.buyOrders.get(order.good);
    if (buyOrders) {
      buyOrders.add(order);
    } else {
      throw new Error(`Unknown good ${order.good.key} in buy order set`);
    }
  }

  sell(order: MarketOrder) {
    const sellOrders: ?Set<MarketOrder> = this.sellOrders.get(order.good);
    if (sellOrders) {
      sellOrders.add(order);
    } else {
      throw new Error(`Unknown good ${order.good.key} in sell order set`);
    }
  }

  simulate() {
    for (const trader: Trader of this.traders) {
      trader.moneyLastRound = trader.money;
      // do their job
      trader.work();
      // perform trades
      trader.trade();

      trader.recordProfit();
    }
  }
}
