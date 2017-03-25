// @flow
import Inventory from './inventory';
import type { Job } from './jobs';
import type { Good } from './goods';
import type { Loan } from './bank';
import { GOODS } from './goods';
import type { OrderType } from './marketOrder';
import MarketOrder from './marketOrder';
import type Market from './market';
import _ from 'lodash';
import PriceRange from './priceRange';
import { goodsForJobs } from './jobsGoodsMap';
import { AccountHolder } from './bank';


let currentId: number = 1;

//
function positionInRange(value: number, min: number, max: number): number {
  value -= min;
  max -= min;
  min = 0;
  value = value / (max - min);
  return _.clamp(value, 0, 1);
}


export default class Trader extends AccountHolder {
  id: number;
  name: string;
  job: Job;
  inventory: Inventory;
  bankrupt: boolean;
  bankruptTimes: number;
  market: ?Market;
  failedTrades: number;
  successfulTrades: number;
  profit: Array<number>;
  priceBelief: Map<Good, PriceRange>;
  observedTradingRange: Map<Good, Array<number>>;
  idleRounds: number;
  lastRound: {
    money: number,
    hasWorked: ?bool,
    hasTraded: ?bool
  };
  thisRoundOrders: {
    buy: Set<MarketOrder>,
    sell: Set<MarketOrder>
  };

  constructor(job: Job, name: string = '') {
    super();
    this.id = currentId;
    currentId++;
    this.job = job;
    this.name = name;
    this.profit = [];
    this.bankruptTimes = 0;
    this.bankrupt = false;
    this.idleRounds = 0; // TODO: this should consider trading to be not idle
    this.failedTrades = 0;
    this.successfulTrades = 0;
    this.inventory = new Inventory();
    this.thisRoundOrders = {
      buy: new Set(),
      sell: new Set()
    };
    this.lastRound = {
      money: 0,
      hasWorked: null,
      hasTraded: null,
    };
  }

  // NOTE: also in worker
  moveToMarket(market: Market) {
    this.market = market;
    this.priceBelief = new Map();
    this.observedTradingRange = new Map();

    // TODO: should price belief be reset when Trader moves to a new Market?

    // price belief initial state
    for (const good: Good of GOODS) {
      const averageGoodPrice: number = this.market.avgHistoricalPrice(good, 15);
      const low: number = averageGoodPrice * 0.5;
      const high: number = averageGoodPrice * 1.5;
      this.observedTradingRange.set(good, [low, high]);
      this.priceBelief.set(good, new PriceRange(low, high));
    }
  }

  // NOTE: also in worker
  work() {
    // subtract Goods required to do job
    if (this.inventory.hasGoods(this.job.requiredGoods)) {
      // take the goods required for the job
      this.inventory.takeGoods(this.job.requiredGoods);
      // perform the job
      this.job.workFunc(this.inventory);
      this.lastRound.hasWorked = true;
      console.log(`Trader #${this.id} worked`);
      this.idleRounds = 0;
    } else {
      console.log(`Trader #${this.id} did not work (${this.idleRounds} idle rounds)`);
      this.lastRound.hasWorked = false;
      this.idleRounds++;
    }

    if (this.idleRounds >= 5) {
      const job: ?Job = this.decideNewJob();
      if (job != null) {
        this.idleRounds = 0;
        console.log(`Trader #${this.id} switched to ${job.displayName} due to not being able to work`);
        this.job = job;
      } else {
        throw new Error(`Cannot switch to null job`);
      }
    }


    if (this.availableFunds < 1 && this.profitLastRound < 1) {
      this.borrowFunds(30);
    }
  }

  // gets a map of goods that we want to trade
  // if amount is positive then we need to sell that good
  // if amount is negative then we need to buy that good
  goodsToTrade(): Map<Good, number> {
    return this.inventory.difference(this.job.idealInventory);
  }

  // trade goods that this Trader needs to buy or sell, returns whether or not they traded this round
  trade(): boolean {
    const buyOrders: Set<MarketOrder> = new Set();
    const sellOrders: Set<MarketOrder> = new Set();

    this.thisRoundOrders.buy = new Set();
    this.thisRoundOrders.sell = new Set();

    // let totalBuyOrderPrices: number = 0;

    // create buy orders for goods required to do work that aren't in the inventory
    const idealDifference: Map<Good, number> = this.goodsToTrade();
    for (const [good, amount]: [Good, number] of idealDifference) {
      if (amount > 0) {
        // surplus: create sell order
        const order: ?MarketOrder = this.createSellOrder(good, Math.abs(amount));
        if (order) {
          sellOrders.add(order);
        }
      } else {
        // deficit: create buy order
        const order: ?MarketOrder = this.createBuyOrder(good, Math.abs(amount));
        if (order) {
          // totalBuyOrderPrices += order.amount;
          // if (totalBuyOrderPrices <= this.availableFunds) {
          buyOrders.add(order);
        }
      }
    }
    // create sell orders for goods in the inventory that aren't required for work

    // send the orders to market
    if (this.market) {
      let balance: number = 0;
      for (const order: MarketOrder of buyOrders) {
        console.log(`Trader ${this.id} is buying ${order.amount} units of ${order.good.displayName} for $${order.price} (has $${this.availableFunds})`);
        balance += order.price * order.amount;
        if (this.availableFunds >= balance) {
          // $FlowFixMe
          this.market.buy(order);
          this.thisRoundOrders.buy.add(order);
        } else {
          console.log(`Trader #${this.id} can't afford ${order.price} (has ${this.availableFunds}) balance of ${balance}`);
        }
      }
      console.log(`Trader #${this.id} total buy amount: $${balance}`);
      for (const order: MarketOrder of sellOrders) {
        console.log(`Trader ${this.id} is selling ${order.amount} units of ${order.good.displayName} for $${order.price}`);
        this.thisRoundOrders.sell.add(order);
        // $FlowFixMe
        this.market.sell(order);
      }
      this.lastRound.hasTraded = true;

      return true;
    } else {
      return false;
    }
  }

  // creates a sell order at the price and quantity that makes sense for this Trader
  createSellOrder(good: Good, limit: number): ?MarketOrder {
    const unitPrice: number = this.determinePriceOf(good);
    const ideal: number = this.determineSellQuantity(good);
    const quantityToSell: number = limit > ideal ? limit : ideal; // can't sell more than the limit
    if (quantityToSell > 0 && unitPrice > 0) {
      return new MarketOrder('sell', good, quantityToSell, unitPrice, this);
    }
  }

  // creates a buy order at the price and quantity that makes sense for this Trader
  createBuyOrder(good: Good, limit: number): ?MarketOrder {
    const unitPrice: number = this.determinePriceOf(good);
    const ideal: number = this.determineBuyQuantity(good);
    const quantityToBuy: number = limit > ideal ? limit : ideal; // can't buy more than the limit
    if (quantityToBuy > 0 && unitPrice > 0 && (unitPrice * quantityToBuy) <= this.availableFunds) {
      return new MarketOrder('buy', good, quantityToBuy, unitPrice, this);
    }
  }

  determinePriceOf(good: Good): number {
    const priceBelief: ?PriceRange = this.priceBelief.get(good);
    if (priceBelief) {
      return priceBelief.random();
    }
    throw new Error('Price belief not set');
  }

  // Gets the lowest and highst price of a Good this trader has seen
  tradingRangeExtremes(good: Good): PriceRange {
    const tradingRange: ?Array<number> = this.observedTradingRange.get(good);
    if (!tradingRange) {
      throw new Error('Trader has no trade data');
    }
    return new PriceRange(_.min(tradingRange), _.max(tradingRange));
  }

  // determine how favorable a price for a good is compared to what have traded
  // a favoribility of 1 means that the price is perfect and we should buy the amount we want to
  // < 1 means that the price is too high and we should buy less
  // > 1 means that the price is too low and we should buy more
  getGoodFavoribility(good: Good, price: number): number {
    const tradingRange: PriceRange = this.tradingRangeExtremes(good);
    return positionInRange(price, tradingRange.low, tradingRange.high);
  }

  // determine how much of a good to sell
  determineSellQuantity(good: Good): number {
    if (!this.market) {
      throw new Error('Trader not at a market');
    }
    const meanPrice: number = this.market.avgHistoricalPrice(good, 15);
    const favoribility: number = this.getGoodFavoribility(good, meanPrice);
    const amountToSell: number = Math.round(favoribility * this.surplusOfGood(good));
    return amountToSell < 1 ? 1 : amountToSell;
  }

  // determine how much of a good to sell
  determineBuyQuantity(good: Good): number {
    if (!this.market) {
      throw new Error('Trader not at a market');
    }
    const meanPrice: number = this.market.avgHistoricalPrice(good, 15);
    const favoribility: number = this.getGoodFavoribility(good, meanPrice);
    const amountToBuy: number = Math.round(favoribility * this.shortageOfGood(good));
    return amountToBuy < 1 ? 1 : amountToBuy;
  }

  // determins how much of a good do we have over the amount that we need
  // i.e. the amount we can safely get rid of
  surplusOfGood(good: Good): number {
    return Math.max(0, Math.abs(this.inventory.get(good) - this.idealAmountOfGood(good)));
  }

  // determine how much of a good to buy
  shortageOfGood(good: Good): number {
    if (this.inventory.get(good) === 0) {
      return this.idealAmountOfGood(good);
    }
    return this.idealAmountOfGood(good) - this.inventory.get(good);
  }

  // NOTE: also in worker
  idealAmountOfGood(good: Good): number {
    return this.job.idealInventory.get(good) || 0;
  }

  priceFor(good: Good): number {
    const priceBelief: ?PriceRange = this.priceBelief.get(good);
    if (!priceBelief) {
      throw new Error('Price belief not set');
    }
    const meanPrice: number = priceBelief.mean();
    return meanPrice;
  }

  updatePriceBelief(good: Good, orderType: OrderType, isSuccessful: bool, clearingPrice: ?number) {
    if (!this.observedTradingRange || !this.market || !this.priceBelief) {
      return;
    }

    const SIGNIFICANT: number = 0.25; // 25% more or less is "significant"
    const SIG_IMBALANCE: number = 0.33;
    const LOW_INVENTORY: number = 0.1; // 10% of ideal inventory = "LOW"
    const HIGH_INVENTORY: number = 2.0; // 200% of ideal inventory = "HIGH"
    const MIN_PRICE: number = 0.01; // lowest allowed price of a Good

    if (isSuccessful && clearingPrice) {
      const tradingRange: ?Array<number> = this.observedTradingRange.get(good);
      if (tradingRange){
        tradingRange.push(clearingPrice);
      }
    }

    const publicMeanPrice: number = this.market.meanPrice(good);
    // $FlowFixMe
    const priceBelief: PriceRange = this.priceBelief.get(good);
    const meanPrice: number = priceBelief.mean();
    let wobble: number = 0.05; // the degree which the Trader should bid outside the belief

    // how different the public mean price is from the price belief
    const deltaToMeanPrice: number = meanPrice - publicMeanPrice;

    if (isSuccessful) {
      if (orderType === 'buy' && deltaToMeanPrice > SIGNIFICANT) {
        priceBelief.low -= deltaToMeanPrice / 2;
        priceBelief.high -= deltaToMeanPrice / 2;
      } else if (orderType === 'sell' && deltaToMeanPrice < -SIGNIFICANT) {
        priceBelief.low -= deltaToMeanPrice / 2;
        priceBelief.high -= deltaToMeanPrice / 2;
      }

      // increase the belief's certainty
      const newLow: number = priceBelief.low + (wobble * meanPrice);
      const newHigh: number = priceBelief.high - (wobble * meanPrice);
      if (newHigh > newLow) {
        priceBelief.low = newLow;
        priceBelief.high = newHigh;
      }
    } else { // failed order

      // shift towards mean price
      priceBelief.low -= deltaToMeanPrice / 2;
      priceBelief.high -= deltaToMeanPrice / 2;

      // check for inventory special cases
      const stock: number = this.inventory.get(good);
      const ideal: number = this.idealAmountOfGood(good);

      if (orderType === 'buy' && stock < LOW_INVENTORY * ideal) {
        // if we're buying and inventory is too low: we're desperate to buy
        wobble *= 5;
      } else if (orderType === 'sell' && stock > HIGH_INVENTORY * ideal) {
        // if we're selling and inventory is too high: we're desperate to sell
        wobble *= 2;
      } else {
        // all other failure cases

        // sum of buy and sell order quantity for a good
        // $FlowFixMe
        const buys: number = this.market.history.buyOrderAmount.average(good, 1);
        // $FlowFixMe
        const sells: number = this.market.history.sellOrderAmount.average(good, 1);

        if (buys + sells > 0) {
          const supplyVsDemand: number = (sells - buys) / (sells + buys);

          if (supplyVsDemand > SIG_IMBALANCE || supplyVsDemand < -SIG_IMBALANCE) {
            // too much supply? lower bid lower to sell faster
            // too much demand? raise price to buy faster

            const newMeanPrice: number = publicMeanPrice * (1 - supplyVsDemand);
            const deltaToMean: number = meanPrice - newMeanPrice;

            // TODO: should we set meanPrice = newMeanPrice here?

            // shift the price belief to the new price mean
            priceBelief.low -= deltaToMean / 2;
            priceBelief.high -= deltaToMean / 2;
          }
        } else {
          throw new Error('Weird case where no buy or sell orders happened');
        }
      }

      // decrease belief's certainty since we've just changed it (we could be wrong)
      priceBelief.low -= wobble * meanPrice;
      priceBelief.high += wobble * meanPrice;

      // make sure the price belief doesn't decrease below the minimum
      if (priceBelief.low < MIN_PRICE) {
        priceBelief.low = MIN_PRICE;
      } else if (priceBelief.high < MIN_PRICE) {
        priceBelief.high = MIN_PRICE;
      }

      if (priceBelief.high < priceBelief.low) {
        throw new Error('Price belief high must be higher than low');
      }
    }
  }

  // NOTE: also in worker
  giveStartInventory() {
    for (const [good, amount]: [Good, number] of this.job.idealInventory.entries()) {
      this.inventory.set(good, amount);
    }
  }

  handleBankruptcy() {
    if (this.bankrupt) {
      // TODO: take out loan
      const loan: ?Loan = this.borrowFunds(10);
      if (loan == null) {
        throw new Error(`Trader #${this.id} failed to take out a loan`);
      }
      const job: ?Job = this.decideNewJob();
      if (job != null) {
        console.log(`Trader #${this.id} switched to ${job.displayName} due to bankrupcy`);
        this.job = job;
      }
      this.bankrupt = false;
      this.bankruptTimes++;
      this.giveStartInventory();
    }
  }

  // NOTE: also in worker
  decideNewJob(): ?Job {
    // look for the good most in demand, switch to the job that produces it
    // if there is no good with a demand ratio above 1.5 ratio, switch to the most profitable job
    // if that job is your current job, then do nothing
    if (this.market == null) {
      return null;
    }
    const mostProfitableJob: ?Job = this.market.mostProfitableJob();
    // $FlowFixMe
    const mostDemandedGood: ?Good = this.market.mostDemandedGood();
    if (mostDemandedGood != null) {
      return goodsForJobs.get(mostDemandedGood);
    } else if (mostProfitableJob != null){
      return mostProfitableJob;
    } else {
      throw new Error('Cannot happen');
    }
  }

  // calculate the payment as a percent of income
  calculatePayment(loan: Loan): number {
    if (!this.availableFunds) {
      return 0;
    }
    if (this.profitLastRound > 0) {
      // percent of their total funds to pay loan with
      let percent: number = 0.25;

      if (loan.balance > this.availableFunds) { // if we can pay it back in full
        percent = 0.50; // then pay a quarter of our funds
      } else if (this.accountRatio < 2) { // if we're poor
        percent = 0.1;
      } else { // we're doing ok, pay more
        percent = 0.25;
      }
      return this.profitLastRound * percent;
    }
    // if we have negative income, pay a very small amount
    return this.availableFunds * 0.15;
  }

  avergagePastProfit(daysAgo: number): number {
    return _.mean(_.takeRight(this.profit, daysAgo));
  }

  get profitLastRound(): number {
    return this.availableFunds - this.lastRound.money;
  }

  recordProfit() {
    const profit: number = this.availableFunds - this.lastRound.money;
    this.profit.push(profit);
  }

  toString(): string {
    return `<Trader id: ${this.id} name: ${this.name || 'none'}>`;
  }

  debug() {
    const changeInMoney: number = _.round(this.availableFunds - this.lastRound.money, 2);
    const totalTrades: number = (this.successfulTrades + this.failedTrades);
    const success: number = _.round(this.successfulTrades / totalTrades * 100, 2);
    const str: string = `Trader #${this.id} (Job: ${this.job.key}, Money: ${this.availableFunds} (Δ ${changeInMoney}), Bankrupt: ${this.bankrupt ? 'Yes' : 'No'}, Successful Trade Percent: ${success}%)`;
    console.groupCollapsed(str);
    this.inventory.debug();
    console.groupEnd(str);
  }
}
