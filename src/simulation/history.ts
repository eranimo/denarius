import Simulation from './index';
import { MarketExport } from './market';
import { InventoryExport } from './inventory';
import { MarketOrderExport } from './marketOrder';
import { LoanExport } from './bank';
import { PriceBeliefExport } from './priceBelief';
import { ProductExport } from './product';


type TraderExport = {
  id: number;
  money: number;
  product: ProductExport;
  liabilities: number;
  justWorked: boolean;
  justTraded: boolean;
  failedTrades: number;
  successfulTrades: number;
  moneyLastRound: number;
  profitLastRound: number;
  accountRatio: number;
  inventory: InventoryExport;
  thisRoundOrders: {
    buy: MarketOrderExport[];
    sell: MarketOrderExport[];
  };
  loans: LoanExport[];
  priceBelief: PriceBeliefExport
}

type ProducerExport = {
  id: number;
  workedLastRound: boolean;
  idleRounds: number;
}

type CompanyExport = {
  traders: TraderExport[];
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
        traders: [],
        producers: [],
        products: [],
      };
      for (const trader of company.traders) {
        const traderExport: TraderExport = {
          id: trader.id,
          product: trader.product.export(),
          money: trader.availableFunds,
          liabilities: trader.liabilities,
          justWorked: trader.lastRound.hasWorked,
          justTraded: trader.lastRound.hasTraded,
          failedTrades: trader.failedTrades,
          successfulTrades: trader.successfulTrades,
          moneyLastRound: trader.lastRound.money,
          profitLastRound: trader.availableFunds - trader.lastRound.money,
          accountRatio: trader.accountRatio,
          inventory: trader.inventory.export(),
          thisRoundOrders: {
            buy: Array.from(trader.buyOrders).map(order => order.export()),
            sell: Array.from(trader.sellOrders).map(order => order.export())
          },
          loans: Array.from(trader.loans).map(load => load.export()),
          priceBelief: trader.priceBelief.export(),
        };
        companyRecord.traders.push(traderExport);
        this.traders.push(traderExport);
      }

      for (const producer of company.workers) {
        companyRecord.producers.push({
          id: producer.id,
          workedLastRound: producer.workedLastRound,
          idleRounds: producer.idleRounds,
        });
      }

      for (const product of company.products) {
        companyRecord.products.push(product.export());
      }

      this.companies.push(companyRecord);
    }
  }
}
