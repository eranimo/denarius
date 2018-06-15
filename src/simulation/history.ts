import Simulation from './index';
import { Good } from './goods';
// import { Job } from './jobs';
import { InventoryExport } from './inventory';
import { MarketOrderExport } from './marketOrder';
import { GOODS } from './goods';
import { LoanExport } from './bank';
import { PriceBeliefExport } from './priceBelief';


type TraderExport = {
  id: number;
  money: number;
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
}

// TODO: rename to Ledger
export default class History {
  round: number;
  traders: any[];
  goodPrices: Map<Good, any>;
  mostDemandedGood: Good;
  mostProfitableGood: Good;
  bank: any;
  companies: any[];

  constructor(sim: Simulation) {
    this.round = sim.round;
    this.traders = [];
    this.companies = [];
    this.goodPrices = new Map();
    this.bank = {
      capital: sim.bank.availableFunds,
      totalDeposits: sim.bank.totalDeposits,
      liabilities: sim.bank.liabilities
    };

    this.mostDemandedGood = sim.market.mostDemandedGood();
    this.mostProfitableGood = sim.market.mostProfitableGood();

    for (const company of sim.companies) {
      const companyRecord: CompanyExport = {
        traders: [],
        producers: [],
      };
      for (const trader of company.traders) {
        companyRecord.traders.push({
          id: trader.id,
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
        });
      }

      for (const producer of company.workers) {
        companyRecord.producers.push({
          id: producer.id,
          workedLastRound: producer.workedLastRound,
          idleRounds: producer.idleRounds,
        });
      }

      this.companies.push(companyRecord);
    }


    GOODS.forEach((good: Good) => {
      this.goodPrices.set(good, {
        meanPrice: sim.market.meanPrice(good),
        supply: sim.market.supplyFor(good),
        demand: sim.market.demandFor(good)
      });
    });
  }
}
