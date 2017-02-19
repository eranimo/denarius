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

function start() {
  // make a market
  const market: Market = new Market();

  // create a few Traders
  for (let i: number = 0; i < SETTINGS.initialJobs.woodcutter; i++) {
    const trader: Trader = new Trader(JOBS.woodcutter);
    market.addTrader(trader);
  };

  for (let i: number = 0; i < SETTINGS.initialJobs.farmer; i++) {
    const trader: Trader = new Trader(JOBS.farmer);
    market.addTrader(trader);
  };
}
