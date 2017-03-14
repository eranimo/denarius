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
      this.history.buyOrderAmount.add(good, [1.0]);
      this.history.sellOrderAmount.add(good, [1.0]);
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
        const unitPrice: number = (buyOrder.price + sellOrder.price) / 2;
        const goodsTraded: number = Math.min(buyOrder.amount, sellOrder.amount);
        const totalPrice: number = goodsTraded * unitPrice;

        console.dir(`Buyer: #${buyOrder.trader.id},  Seller: #${sellOrder.trader.id},  Good: ${buyOrder.good.displayName},  Quantity: ${goodsTraded}, Unit Price: $${unitPrice},  Total Price: $${totalPrice}, Buyer has $${buyOrder.trader.availableFunds}`);

        // if the buyer doesn't have the correct amount of money, borrow it
        if (!buyOrder.trader.account.has(totalPrice)) {
          const difference: number = totalPrice - buyOrder.trader.availableFunds;
          buyOrder.trader.borrowFunds(difference);
        }

        // remove money from buyer and give it to seller
        this.transferGood(sellOrder.trader, buyOrder.trader, buyOrder.good, goodsTraded);
        this.transferMoney(buyOrder.trader, sellOrder.trader, totalPrice);

        // update metrics
        buyOrder.trader.successfulTrades++;
        sellOrder.trader.successfulTrades++;

        // update price beliefs
        buyOrder.trader.updatePriceBelief(buyOrder.good, buyOrder.orderType, true, unitPrice);
        sellOrder.trader.updatePriceBelief(sellOrder.good, sellOrder.orderType, true, unitPrice);

        // change amounts
        buyOrder.amount = buyOrder.amount - goodsTraded;
        sellOrder.amount = sellOrder.amount - goodsTraded;

        buyOrder.finalPrice = unitPrice;
        sellOrder.finalPrice = unitPrice;

        // throw out (deny) all other orders
        if (buyOrder.amount === 0) {
          sortedBuyOrders.shift();
        }

        if (sellOrder.amount === 0) {
          sortedSellOrders.shift();
        }

        moneyTraded += totalPrice;
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
      this.history.buyOrderAmount.add(good, [totalBuyAmount]);
      this.history.sellOrderAmount.add(good, [totalSellAmount]);
      this.history.unitsTraded.add(good, [unitsTraded]);

      if (unitsTraded > 0) {
        this.history.prices.add(good, [moneyTraded / unitsTraded]);
      } else {
        // no units were traded this round, so use the last round's average price
        this.history.prices.add(good, [this.history.prices.average(good, 1)]);
      }

      const jobProfit: Map<Job, Array<number>> = new Map();

      for (const trader: Trader of this.traders) {
        if (jobProfit.has(trader.job)) {
          // $FlowFixMe
          const newArr: Array<number> = jobProfit.get(trader.job);
          newArr.push(trader.profitLastRound);
          jobProfit.set(trader.job, newArr);
        } else {
          jobProfit.set(trader.job, [trader.profitLastRound]);
        }
      }

      for (const [job, profit]: [Job, Array<number>] of jobProfit.entries()) {
        this.history.profit.add(job, profit);
      }

      this.buyOrders.set(good, new Set());
      this.sellOrders.set(good, new Set());
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
    if (fromTrader.availableFunds >= amount) {
      fromTrader.account.transferTo(toTrader.account, amount);
    } else {
      throw new Error(`Trader ${fromTrader.toString()} doesn't have ${amount} money (it has ${fromTrader.availableFunds})`);
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

  // gets the most profitable job at this market
  mostProfitableJob(dayRange: number = 10): ?Job {
    let best: number = -Infinity;
    let bestJob: ?Job = null;

    for (const job: Job of JOBS) {
      const avgProfit: number = this.history.profit.average(job, dayRange);

      if (avgProfit > best) {
        bestJob = job;
        best = avgProfit;
      }
    }

    return bestJob;
  }

  // Get the good with the highest demand/supply ratio over time at this market
  // minimum: the minimum demand/supply ratio to consider an opportunity
  // dayRange: number of rounds to look back
  mostDemandedGood(minimum: number = 1.5, dayRange: number = 10): ?Good {
    let bestGood: ?Good = null;
    let bestRatio: number = -Infinity;

    for (const good: Good of GOODS) {
      let buys: number = this.history.buyOrderAmount.average(good, dayRange);
      let sells: number = this.history.sellOrderAmount.average(good, dayRange);

      if (buys > 0 || sells > 0) {
        // if this Good is traded in this Market
        if (sells === 0 && buys === 0) {
          // make a fake supply of 0.5 for each unit to avoid
          // an infinite ratio of supply to demand
          sells = 0.5;
        }

        const ratio: number = buys / sells;

        if (ratio > minimum && ratio > bestRatio) {
          bestRatio = ratio;
          bestGood = good;
        }
      }
    }

    return bestGood;
  }

  // get the price of a good at this market last round
  meanPrice(good: Good): number {
    return this.history.prices.average(good, 1);
  }

  demandFor(good: Good): number {
    return this.history.buyOrderAmount.average(good, 1);
  }

  supplyFor(good: Good): number {
    return this.history.sellOrderAmount.average(good, 1);
  }

  simulate() {
    const overTitle: string = `Traders working and trading`;
    console.groupCollapsed(overTitle);
    for (const trader: Trader of this.traders) {
      trader.lastRound.money = trader.availableFunds;
      // do their job
      console.groupCollapsed(`Trader #${trader.id} working`);
      trader.work();
      console.groupEnd(`Trader #${trader.id} working`);
      // perform trades
      const title: string = `Trader #${trader.id} is trading`;
      console.groupCollapsed(title);
      trader.trade();
      console.groupEnd(title);

      trader.recordProfit();

      trader.handleBankruptcy();
    }
    console.groupEnd(overTitle);

    // resolve the orders for this round
    const title: string = `Resolving orders`;
    console.groupCollapsed(title);
    this.resolveOrders();
    console.groupEnd(title);

    this.history.debug();
  }
}
