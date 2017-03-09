// @flow
import Trader from './trader';
import Market from './market';
// import * as GOODS from './goods';
import * as JOBS from './jobs';
import History from './history';
import { Bank } from './bank';
import type { Loan } from './bank';


const SETTINGS: Object = {
  initialJobs: {
    woodcutter: 5,
    farmer: 5
  },
  bank: {
    startingFunds: 100
  }
};

// handles the market instance and the passing of time
export default class Simulation {
  round: number;
  market: Market;
  history: Array<History>;
  bank: Bank;
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

    // make a bank
    this.bank = new Bank(SETTINGS.bank.startingFunds);

    // make a market
    this.market = new Market();

    // create a few Traders with some inventory
    // woodcutters
    for (let i: number = 0; i < SETTINGS.initialJobs.woodcutter; i++) {
      const trader: Trader = new Trader(JOBS.woodcutter);
      trader.giveStartInventory();
      this.bank.createAccount(trader, 10);
      this.market.addTrader(trader);
    }

    // farmers
    for (let i: number = 0; i < SETTINGS.initialJobs.farmer; i++) {
      const trader: Trader = new Trader(JOBS.farmer);
      trader.giveStartInventory();
      this.bank.createAccount(trader, 10);
      this.market.addTrader(trader);
    }
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
    console.groupCollapsed('Traders after trade:');
    for (const trader: Trader of this.market.traders) {
      trader.debug();
    }
    console.groupEnd('Traders after trade:');
    console.groupEnd(text);

    this.bank.accrueAndChargeInterest();
    this.bank.closeLoans();

    for (const trader: Trader of this.market.traders) {
      for (const loan: Loan of trader.loans) {
        loan.repay();
      }
    }

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
