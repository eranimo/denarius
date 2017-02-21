// @flow
import Inventory from './inventory';
import type { Job } from './jobs';
import type { Good } from './goods';
import { GOODS } from './goods';
import type { OrderType } from './marketOrder';
import MarketOrder from './marketOrder';
import type Market from './market';
import _ from 'lodash';
import PriceRange from './priceRange';


function positionInRange(value: number, min: number, max: number): number {
  value -= min;
  max -= min;
  min = 0;
  value = value / (max - min);
  return _.clamp(value, 0, 1);
}


export default class Trader {
  job: Job;
  inventory: Inventory;
  money: number;
  moneyLastRound: number;
  market: ?Market;
  failedTrades: number;
  successfulTrades: number;
  priceBelief: Map<Good, PriceRange>;
  observedTradingRange: Map<Good, Array<number>>;
  lastRound: {
    hasWorked: ?bool,
    hasTraded: ?bool
  };

  constructor(job: Job) {
    this.job = job;
    this.money = 10;
    this.moneyLastRound = 0;
    this.failedTrades = 0;
    this.successfulTrades = 0;
    this.inventory = new Inventory();
    this.lastRound = {
      hasWorked: null,
      hasTraded: null,
    };
  }

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

  // do their job
  work() {
    // subtract Goods required to do job
    if (this.inventory.hasGoods(this.job.requiredGoods)) {
      // take the goods required for the job
      this.inventory.takeGoods(this.job.requiredGoods);
      // perform the job
      this.job.workFunc(this.inventory);
      this.lastRound.hasWorked = true;
    } else {
      this.lastRound.hasWorked = false;
    }
  }

  // trade goods that this Trader needs to buy or sell, returns whether or not they traded this round
  trade(): bool {
    const buyOrders: Set<MarketOrder> = new Set();
    const sellOrders: Set<MarketOrder> = new Set();
    // create buy orders for goods required to do work that aren't in the inventory
    const idealDifference: Map<Good, number> = this.inventory.difference(this.job.idealInventory);
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
          sellOrders.add(order);
        }
      }
    }
    // create sell orders for goods in the inventory that aren't required for work

    // send the orders to market
    if (this.market) {
      for (const order: MarketOrder of buyOrders) {
        this.market.buy(order);
      }
      for (const order: MarketOrder of sellOrders) {
        this.market.sell(order);
      }
      return true;
    } else {
      return false;
    }
  }

  // creates a sell order at the price and quantity that makes sense for this Trader
  createSellOrder(good: Good, limit: number): ?MarketOrder {
    const price: number = this.determinePriceOf(good);
    const ideal: number = this.determineSellQuantity(good);
    const quantityToSell: number = limit > ideal ? limit : ideal; // can't sell more than the limit
    if (quantityToSell > 0) {
      return new MarketOrder('sell', good, quantityToSell, price, this);
    }
  }

  // creates a buy order at the price and quantity that makes sense for this Trader
  createBuyOrder(good: Good, limit: number): ?MarketOrder {
    const price: number = this.determinePriceOf(good);
    const ideal: number = this.determineBuyQuantity(good);
    const quantityToBuy: number = limit > ideal ? limit : ideal; // can't buy more than the limit
    if (quantityToBuy > 0) {
      return new MarketOrder('buy', good, quantityToBuy, price, this);
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

  // determine how much of a good to sell
  determineSellQuantity(good: Good): number {
    if (!this.market) {
      throw new Error('Trader not at a market');
    }
    const meanPrice: number = this.market.avgHistoricalPrice(good, 15);
    const tradingRange: PriceRange = this.tradingRangeExtremes.get(good);
    const favoribility: number = positionInRange(meanPrice, tradingRange.low, tradingRange.high);
    const amountToSell: number = Math.round(favoribility * this.surplusOfGood(good));
    return amountToSell < 1 ? 1 : amountToSell;
  }

  // determine how much of a good to sell
  determineBuyQuantity(good: Good): number {
    if (!this.market) {
      throw new Error('Trader not at a market');
    }
    const meanPrice: number = this.market.avgHistoricalPrice(good, 15);
    const tradingRange: PriceRange = this.tradingRangeExtremes.get(good);
    const favoribility: number = positionInRange(meanPrice, tradingRange.low, tradingRange.high);
    const amountToBuy: number = Math.round(favoribility * this.shortageOfGood(good));
    return amountToBuy < 1 ? 1 : amountToBuy;
  }

  surplusOfGood(good: Good): number {
    return Math.min(0, this.inventory.get(good) - this.idealAmountOfGood(good));
  }

  shortageOfGood(good: Good): number {
    if (this.inventory.get(good) === 0) {
      return this.idealAmountOfGood(good);
    }
    return this.idealAmountOfGood(good) - this.inventory.get(good);
  }

  idealAmountOfGood(good: Good): number {
    return this.job.idealInventory.get(good) || 0;
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

    const publicMeanPrice: number = this.market.avgHistoricalPrice(good, 1);
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
      priceBelief.low += wobble * meanPrice;
      priceBelief.high -= wobble * meanPrice;
    } else { // failed order

      // shift towards mean price
      priceBelief.low -= deltaToMeanPrice / 2;
      priceBelief.high -= deltaToMeanPrice / 2;

      // check for inventory special cases
      const stock: number = this.inventory.get(good);
      const ideal: number = this.idealAmountOfGood(good);

      if (orderType === 'buy' && stock < LOW_INVENTORY * ideal) {
        // if we're buying and inventory is too low: we're desperate to buy
        wobble *= 2;
      } else if (orderType === 'sell' && stock > HIGH_INVENTORY * ideal) {
        // if we're selling and inventory is too high: we're desperate to sell
        wobble *= 2;
      } else {
        // all other failure cases

        // $FlowFixMe
        const buys: number = this.market.history.numBuyOrders.average(good, 1);
        // $FlowFixMe
        const sells: number = this.market.history.numSellOrders.average(good, 1);

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
    }
  }

  debug() {
    const str: string = `Trader (Job: ${this.job.key}, Money: ${this.money})`;
    console.groupCollapsed(str);
    this.inventory.debug();
    console.groupEnd(str);
  }
}
