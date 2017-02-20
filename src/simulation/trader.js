// @flow
import Inventory from './inventory';
import type { Job } from './jobs';
import type { Good } from './goods';
import type { OrderType } from './marketOrder';
import MarketOrder from './marketOrder';
import type Market from './market';
import _ from 'lodash';


export default class Trader {
  job: Job;
  inventory: Inventory;
  money: number;
  moneyLastRound: number;
  market: ?Market;
  failedTrades: number;
  successfulTrades: number;
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
    return 0;
  }

  // determine how much of a good to sell
  determineSellQuantity(good: Good): number {
    return 0;
  }

  // determine how much of a good to buy
  determineBuyQuantity(good: Good): number {
    return 0;
  }

  updatePriceBelief(good: Good, orderType: OrderType, isSuccessful: bool) {
    // TODO: handle price belief
  }

  toString(): string {
    return `Trader(job: ${this.job.displayName})`;
  }

  debug() {
    const str: string = `Trader (Job: ${this.job.key}, Money: ${this.money})`;
    console.groupCollapsed(str);
    this.inventory.debug();
    console.groupEnd(str);
  }
}
