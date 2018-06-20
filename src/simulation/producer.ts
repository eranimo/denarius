import { Job } from './jobs';
import { Good } from './goods';
import Inventory from './inventory';
import { isRawGood } from './production';
import Company from './company';
import Trader, { TraderExport } from './trader';
import Product from './product';
import Market from './market';


export type ProducerExport = TraderExport & {
  workedLastRound: boolean;
  idleRounds: number;
}

export default class Producer extends Trader {
  workedLastRound: boolean;
  idleRounds: number;
  companyInventory: Inventory;
  employer: Company | null;
  product: Product | null;
  job: Job;

  constructor(market: Market, job: Job) {
    super(market);
    this.job = job;
    this.workedLastRound = false;
    this.idleRounds = 0;
    this.employer = null;
    this.companyInventory = new Inventory();
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
      throw new Error('Producer can not work, has no assigned product.')
    }

    if (!this.job) {
      throw new Error('Producer can not work, has no job');
    }

    // subtract Goods required to do job
    if (isRawGood(this.product.good)) {
      // console.log(`Trader #${this.id} worked`);
      this.companyInventory.add(this.product.good, 1);
      this.workedLastRound = true;
      return true;
    }

    if (this.companyInventory.hasAmounts(this.product.requiredGoods)) {
      // take the goods required for the job
      // perform the job
      this.companyInventory.removeMulti(this.product.requiredGoods);
      this.companyInventory.add(this.product.good, 1);
      this.workedLastRound = true;
      // console.log(`Trader #${this.id} worked`);
      this.idleRounds = 0;
      return true;
    } else {
      // console.log(`Trader #${this.id} did not work (${this.idleRounds} idle rounds)`);
      this.workedLastRound = false;
      this.idleRounds++;
      return false;
    }
  }

  get canWork() {
    return isRawGood(this.product.good) || this.companyInventory.hasAmounts(this.product.requiredGoods);
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

  export(): ProducerExport {
    return {
      ...super.export(),
      kind: 'Producer',
      idleRounds: this.idleRounds,
      workedLastRound: this.workedLastRound,
    };
  }
}
