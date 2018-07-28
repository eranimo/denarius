import Simulation from '.';
import { MarketExport } from './market';
import { TraderExport } from './trader';
import { CompanyExport } from './company';


// TODO: rename to Ledger
export default class History {
  round: number;
  traders: TraderExport[];
  market: MarketExport;
  bank: any;
  companies: CompanyExport[];

  constructor(sim: Simulation) {
    this.round = sim.round;
    this.companies = [];
    this.traders = [];
    this.bank = {
      capital: sim.bank.availableFunds,
      totalDeposits: sim.bank.totalDeposits,
      liabilities: sim.bank.liabilities
    };
    this.market = sim.market.export();

    for (const company of sim.companies) {
      const companyRecord = company.export();
      this.companies.push(companyRecord);
      for (const traderExport of companyRecord.merchants) {
        this.traders.push(traderExport);
      }
      for (const traderExport of companyRecord.producers) {
        this.traders.push(traderExport);
      }
    }
  }
}
