// @flow
import Inventory from './inventory';
import Trader from './trader';
import Market from './market';
import * as JOBS from './jobs';
import * as GOODS from './goods';
import type { Job } from './jobs';
import type { Good } from './goods';



const SETTINGS: Object = {
  initialJobs: {
    woodcutter: 5,
    farmer: 5
  }
};

// handles the market instance and the passing of time
export default class Simulation {
  round: number;
  market: Market;
  constructor() {
    // start time
    this.round = 0;

    // make a market
    this.market = new Market(this);

    // create a few Traders with some inventory
    // woodcutters
    for (let i: number = 0; i < SETTINGS.initialJobs.woodcutter; i++) {
      const trader: Trader = new Trader(JOBS.woodcutter);
      trader.inventory.add(GOODS.food, 3);
      trader.inventory.add(GOODS.wood, 3);
      this.market.addTrader(trader);
    };

    // farmers
    for (let i: number = 0; i < SETTINGS.initialJobs.farmer; i++) {
      const trader: Trader = new Trader(JOBS.farmer);
      trader.inventory.add(GOODS.food, 3);
      trader.inventory.add(GOODS.wood, 3);
      this.market.addTrader(trader);
    };
  }

  nextRound() {
    this.round += 1;
    this.market.traders.forEach((trader: Trader) => {
      // do their job
      trader.work();
      // perform trades
      trader.trade();
    });

    // resolve the orders for this round
    this.market.resolveOrders();
  }
}
