// @flow
import Inventory from './inventory';
import type { Job } from './jobs';


export default class Trader {
  job: Job;
  inventory: Inventory;

  constructor(job: Job) {
    this.job = job;
    this.inventory = new Inventory();
  }
}
