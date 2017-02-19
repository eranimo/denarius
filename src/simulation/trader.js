// @flow
import Inventory from './inventory';
import type { Job } from './jobs';
import type { Good } from './goods';
import _ from 'lodash';


export default class Trader {
  job: Job;
  inventory: Inventory;
  money: number;
  lastRound: {
    hasWorked: ?bool,
    hasTraded: ?bool
  };

  constructor(job: Job) {
    this.job = job;
    this.money = 0;
    this.inventory = new Inventory();
    this.lastRound = {
      hasWorked: null,
      hasTraded: null,
    };
  }

  // do their job
  work() {
    // subtract Goods required to do job
    let hasRequiredGoods: bool = true;
    _.forEach(this.job.requiredGoods, (good: Good, amount: number) => {
      if (!this.inventory.hasAmount(good, amount)) {
        hasRequiredGoods = false;
      }
    });
    // perform the job
    if (hasRequiredGoods) {
      this.job.workFunc(this.inventory);
      this.lastRound.hasWorked = true;
    } else {
      this.lastRound.hasWorked = false;
    }
  }

  trade() {
    // decide if we need to trade
    // create buy orders for goods required to do work that aren't in the inventory
    // create sell orders for goods in the inventory that aren't required for work
  }
}
