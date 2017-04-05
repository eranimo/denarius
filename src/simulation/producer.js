// @flow
import type { Job } from './jobs';
import type { Good } from './goods';
import Inventory from './inventory';
import PriceRange from './priceRange';
import { blueprintFor, isRawGood } from './production';
import type Company from './company';
import Trader from './trader';
import type Market from './market';
import type Product from './product';


export default class Producer extends Trader {
  priceBelief: Map<Good, PriceRange>;
  workedLastRound: boolean;
  idleRounds: number;
  employer: ?Company;
  product: ?Product;

  constructor(market: Market, job: Job) {
    super(market);
    this.workedLastRound = false;
    this.job = job;
    this.idleRounds = 0;
    this.employer = null;
    this.product = null;
  }

  get isEmployed(): boolean {
    return this.employer != null;
  }

  changeEmployer(company: Company) {
    this.employer = company;
  }

  work(): boolean {
    if (!this.product) {
      this.workedLastRound = false;
      return false;
    }
    // $FlowFixMe
    const inventory: Inventory = this.isEmployed ? this.employer.inventory : this.inventory;

    // subtract Goods required to do job
    if (isRawGood(this.product.good)) {
      inventory.add(this.product.good, 1);
      return true;
    }

    // $FlowFixMe
    if (inventory.hasAmounts(this.product.requiredGoods)) {
      // take the goods required for the job
      // perform the job
      this.job.workFunc(inventory);
      this.workedLastRound = true;
      console.log(`Trader #${this.id} worked`);
      this.idleRounds = 0;
    } else {
      console.log(`Trader #${this.id} did not work (${this.idleRounds} idle rounds)`);
      this.workedLastRound = false;
      this.idleRounds++;
    }
    return true;
  }

  idealAmountOfGood(good: Good): number {
    if (!this.product) {
      return 0;
    }
    return this.product.requiredGoods.get(good) || 0;
  }

  giveStartInventory() {
    if (!this.product) {
      return;
    }
    this.inventory.addMulti(this.product.requiredGoods);
  }
}
