// @flow
import type { Job } from './jobs';
import type { Good } from './goods';
import Inventory from './inventory';
import PriceRange from './priceRange';
import { AccountHolder } from './bank';
import type Market from './market';
import { goodsForJobs } from './jobsGoodsMap';
import { HasID } from './mixins';


export default class Worker extends HasID(AccountHolder) {
  inventory: Inventory;
  priceBelief: Map<Good, PriceRange>;
  workedLastRound: boolean;
  idleRounds: number;
  market: Market;

  constructor(job: Job) {
    super();
    this.inventory = new Inventory();
    this.workedLastRound = false;
    this.job = job;
    this.idleRounds = 0;
  }

  moveToMarket(market: Market) {
    this.market = market;
  }

  work() {
    // subtract Goods required to do job
    if (this.inventory.hasGoods(this.job.requiredGoods)) {
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

    if (this.idleRounds >= 5) {
      const job: ?Job = this.decideNewJob();
      if (job != null) {
        this.idleRounds = 0;
        console.log(`Trader #${this.id} switched to ${job.displayName} due to not being able to work`);
        this.job = job;
      } else {
        throw new Error(`Cannot switch to null job`);
      }
    }
  }

  idealAmountOfGood(good: Good): number {
    return this.job.idealInventory.get(good) || 0;
  }

  giveStartInventory() {
    for (const [good, amount]: [Good, number] of this.job.idealInventory.entries()) {
      this.inventory.set(good, amount);
    }
  }

  decideNewJob(): ?Job {
    // look for the good most in demand, switch to the job that produces it
    // if there is no good with a demand ratio above 1.5 ratio, switch to the most profitable job
    // if that job is your current job, then do nothing
    if (this.market == null) {
      return null;
    }
    const mostProfitableJob: ?Job = this.market.mostProfitableJob();
    const mostDemandedGood: ?Good = this.market.mostDemandedGood();
    if (mostDemandedGood != null) {
      return goodsForJobs.get(mostDemandedGood);
    } else if (mostProfitableJob != null){
      return mostProfitableJob;
    } else {
      throw new Error('Cannot happen');
    }
  }
}
