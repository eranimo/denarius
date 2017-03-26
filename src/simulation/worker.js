// @flow
import type { Job } from './jobs';
import type { Good } from './goods';
import { ValuedInventory } from './inventory';
import PriceRange from './priceRange';
import { AccountHolder } from './bank';
import type Market from './market';
import { HasID } from './mixins';
import { blueprintFor, isRawGood } from './production';
import type Company from './company';


export default class Worker extends HasID(AccountHolder) {
  inventory: ValuedInventory;
  priceBelief: Map<Good, PriceRange>;
  workedLastRound: boolean;
  idleRounds: number;
  market: Market;
  employer: ?Company;

  constructor(job: Job) {
    super();
    this.inventory = new ValuedInventory();
    this.workedLastRound = false;
    this.job = job;
    this.idleRounds = 0;
    this.employer = null;
  }

  moveToMarket(market: Market) {
    this.market = market;
  }

  changeEmployer(company: Company) {
    this.employer = company;
  }

  work(): boolean {
    // subtract Goods required to do job
    if (isRawGood(this.job.output)) {
      this.inventory.add(this.job.output, 1);
      return true;
    }

    const reqs: Map<Good, number> = blueprintFor(this.job.output);
    if (this.inventory.hasAmounts(reqs)) {
      // take the goods required for the job
      // perform the job
      this.job.workFunc(this.inventory);
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
    return this.job.idealInventory.get(good) || 0;
  }

  giveStartInventory() {
    for (const [good, amount]: [Good, number] of this.job.idealInventory.entries()) {
      this.inventory.add(good, amount);
    }
  }
}
