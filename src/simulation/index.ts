
import Company from './company';
import Market from './market';
import History from './history';
import { Bank } from './bank';
import { simpleStart } from './init';



// handles the market instance and the passing of time
export default class Simulation {
  round: number;
  history: Array<History>;
  market: Market;
  bank: Bank;
  hook: Function;
  companies: Company[];

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

    const { market, bank, companies } = simpleStart();
    this.market = market;
    this.bank = bank;
    this.companies = companies;
  }

  nextRound(): History {
    this.round += 1;
    const text: string = `Simulation round #${this.round}`;
    console.groupCollapsed(text);
    console.groupCollapsed('Traders before trade:');
    // for (const trader of this.market.traders) {
    //   trader.debug();
    // }
    console.groupEnd();

    this.market.simulate();

    console.groupCollapsed('Traders after trade:');
    // for (const trader of this.market.traders) {
    //   trader.debug();
    // }
    console.groupEnd();
    console.groupEnd();

    this.bank.accrueAndChargeInterest();
    this.bank.closeLoans();

    for (const trader of this.market.traders) {
      for (const loan of trader.loans) {
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
