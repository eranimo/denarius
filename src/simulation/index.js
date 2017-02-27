// @flow
import Inventory from './inventory';
import Trader from './trader';
import Market from './market';
import * as GOODS from './goods';
import * as JOBS from './jobs';
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
    this.setup();
  }

  reset() {
    this.setup();
  }


  setup() {
    // start time
    this.round = 0;

    // make a market
    this.market = new Market();

    // create a few Traders with some inventory
    // woodcutters
    for (let i: number = 0; i < SETTINGS.initialJobs.woodcutter; i++) {
      const trader: Trader = new Trader(JOBS.woodcutter);
      trader.inventory.add(GOODS.food, 5);
      this.market.addTrader(trader);
    };

    // farmers
    for (let i: number = 0; i < SETTINGS.initialJobs.farmer; i++) {
      const trader: Trader = new Trader(JOBS.farmer);
      trader.inventory.add(GOODS.wood, 5);
      this.market.addTrader(trader);
    };
  }

  nextRound() {
    this.round += 1;
    const text: string = `Simulation round #${this.round}`;
    console.group(text);
    console.groupCollapsed('Traders before trade:');
    for (const trader: Trader of this.market.traders) {
      trader.debug();
    }
    console.groupEnd('Traders before trade:');
    this.market.simulate();
    // resolve the orders for this round
    this.market.resolveOrders();
    console.groupCollapsed('Traders after trade:');
    for (const trader: Trader of this.market.traders) {
      trader.debug();
    }
    console.groupEnd('Traders after trade:');
    console.groupEnd(text);

  }
}
