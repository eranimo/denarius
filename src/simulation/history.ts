import Simulation from './index';
import { MarketExport } from './market';
import { ProductExport } from './product';
import { TraderExport } from './trader';
import { ProducerExport } from './producer';


type CompanyExport = {
  merchants: TraderExport[];
  producers: ProducerExport[];
  products: ProductExport[];
}

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
      const companyRecord: CompanyExport = {
        merchants: [],
        producers: [],
        products: [],
      };
      for (const merchant of company.merchants) {
        const merchantExport = merchant.export();
        companyRecord.merchants.push(merchantExport);
        this.traders.push(merchantExport);
      }

      for (const producer of company.producers) {
        const producerExport = producer.export();
        companyRecord.producers.push(producerExport);
        this.traders.push(producerExport);
      }

      for (const product of company.products) {
        companyRecord.products.push(product.export());
      }

      this.companies.push(companyRecord);
    }
  }
}
