import type { Simulation } from './index';
import type { Good } from './goods';
import type { Job } from './jobs';
import { GOODS } from './goods';


export default class History {
  round: number;
  traders: Array<Object>;
  goodPrices: Map<Good, Object>;
  mostDemandedGood: ?Good;
  mostProfitableJob: ?Job;

  constructor(sim: Simulation) {
    this.round = sim.round;
    this.traders = [];
    this.goodPrices = new Map();

    this.mostDemandedGood = sim.market.mostDemandedGood();
    this.mostProfitableJob = sim.market.mostProfitableJob();

    for (const trader: Trader of sim.market.traders) {
      this.traders.push({
        id: trader.id,
        money: trader.money,
        moneyLastRound: trader.moneyLastRound,
        profitLastRound: trader.money - trader.moneyLastRound,
        job: trader.job.key,
        bankruptTimes: trader.bankruptTimes,
        inventory: trader.inventory.export()
      });
    }

    GOODS.forEach((good: Good): Object => {
      this.goodPrices.set(good, {
        meanPrice: sim.market.meanPrice(good),
        supply: sim.market.supplyFor(good),
        demand: sim.market.demandFor(good)
      });
    });
  }
}
