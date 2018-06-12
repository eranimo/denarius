import { Job } from './jobs';
import { Good } from './goods';
import Inventory from './inventory';
import { isRawGood } from './production';
import Company from './company';
import Trader from './trader';
import Product from './product';
import Market from './market';


export default class Producer extends Trader {
  workedLastRound: boolean;
  idleRounds: number;
  employer: Company | null;
  product: Product | null;
  job: Job;

  constructor(market: Market, job: Job) {
    super(market);
    this.job = job;
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
    const inventory: Inventory = this.isEmployed ? this.employer.inventory : this.inventory;

    // subtract Goods required to do job
    if (isRawGood(this.product.good)) {
      // console.log(`Trader #${this.id} worked`);
      inventory.add(this.product.good, 1);
      this.workedLastRound = true;
      return true;
    }

    if (inventory.hasAmounts(this.product.requiredGoods)) {
      // take the goods required for the job
      // perform the job
      inventory.removeMulti(this.product.requiredGoods);
      this.workedLastRound = true;
      // console.log(`Trader #${this.id} worked`);
      this.idleRounds = 0;
    } else {
      // console.log(`Trader #${this.id} did not work (${this.idleRounds} idle rounds)`);
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
