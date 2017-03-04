// @flow
import Inventory from './inventory';
import Trader from './trader';
import Market from './market';
import * as GOODS from './goods';
import * as JOBS from './jobs';
import type { Job } from './jobs';
import type { Good } from './goods';

export class History {
  round: number;
  traders: Array<Object>;

  constructor(sim: Simulation) {
    this.round = sim.round;
    this.traders = [];

    for (const trader: Trader of sim.market.traders) {
      this.traders.push({
        id: trader.id,
        money: trader.money,
        moneyLastRound: trader.moneyLastRound,
        profitLastRound: trader.money - trader.moneyLastRound,
        job: trader.job.key,
        inventory: trader.inventory.export()
      });
    }
  }
}


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
  history: Array<History>;
  hook: Function;

  constructor() {
    this.setup();
    this.history = [];
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

  nextRound(): History {
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

    const history: History = this.recordHistory();

    if (this.hook) {
      this.hook(history);
    }

    return history;
  }

  recordHistory(): History {
    const history: History = new History(this);
    this.history.push(history);
    return history;
  }
}
