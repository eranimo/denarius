// @flow
import Inventory from './inventory';
import type { Job } from './jobs';
import type { Good } from './goods';
import type { OrderType } from './marketOrder';
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

  trade() {
    // TODO: decide if we need to trade
    // create buy orders for goods required to do work that aren't in the inventory
    // create sell orders for goods in the inventory that aren't required for work
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
