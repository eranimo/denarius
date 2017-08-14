// @flow
import type { Job } from './jobs';
import type { Good } from './goods';
import Inventory from './inventory';
import PriceRange from './priceRange';
import { blueprintFor, isRawGood } from './production';
import type Company from './company';
import Logic from './logic';
import type Market from './market';
import type Product from './product';


export default class ProducerLogic extends Logic {
  priceBelief: Map<Good, PriceRange>;
  workedLastRound: boolean;
  idleRounds: number;
  employer: ?Company;
  product: ?Product;
  job: Job;

  onInit() {
    this.workedLastRound = false;
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

    if (!this.job) {
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
      // $FlowFixMe
      inventory.removeMulti(this.product.requiredGoods);
      this.workedLastRound = true;
      console.log(`Trader #${this.entity.id} worked`);
      this.idleRounds = 0;
    } else {
      console.log(`Trader #${this.entity.id} did not work (${this.idleRounds} idle rounds)`);
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
    this.entity.inventory.addMulti(this.product.requiredGoods);
  }
}
