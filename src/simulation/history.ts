import Simulation from './index';
import { Good } from './goods';
import { Job } from './jobs';
import { GOODS } from './goods';


// TODO: rename to Ledger
export default class History {
  round: number;
  traders: Array<Object>;
  goodPrices: Map<Good, Object>;
  mostDemandedGood: Good;
  mostProfitableGood: Good;
  bank: any;

  constructor(sim: Simulation) {
    this.round = sim.round;
    this.traders = [];
    this.goodPrices = new Map();
    this.bank = {
      capital: sim.bank.availableFunds,
      totalDeposits: sim.bank.totalDeposits,
      liabilities: sim.bank.liabilities
    };

    this.mostDemandedGood = sim.market.mostDemandedGood();
    this.mostProfitableGood = sim.market.mostProfitableGood();

    for (const trader of sim.market.traders) {
      let loans: Array<Object> = [];
      let priceBelief: Array<Object> = [];
      GOODS.forEach((good: Good) => {
        priceBelief.push({
          good: good,
          price: trader.priceBelief.meanPriceFor(good),
          low: trader.priceBelief.prices.get(good).low,
          high: trader.priceBelief.prices.get(good).high
        });
      });
      for (const loan of trader.loans) {
        loans.push({
          balance: loan.balance,
          interestRate: loan.interestRate,
          repayments: loan.repayments,
          missedRepayments: loan.missedRepayments
        });
      }

      this.traders.push({
        id: trader.id,
        money: trader.availableFunds,
        liabilities: trader.liabilities,
        justWorked: trader.lastRound.hasWorked,
        justTraded: trader.lastRound.hasTraded,
        failedTrades: trader.failedTrades,
        successfulTrades: trader.successfulTrades,
        idleRounds: trader.idleRounds,
        moneyLastRound: trader.lastRound.money,
        profitLastRound: trader.availableFunds - trader.lastRound.money,
        job: trader.job.key,
        accountRatio: trader.accountRatio,
        bankruptTimes: trader.bankruptTimes,
        inventory: trader.inventory.export(),
        thisRoundOrders: {
          buy: Array.from(trader.thisRoundOrders.buy).map((order: any): any => order.export()),
          sell: Array.from(trader.thisRoundOrders.sell).map((order: any): any => order.export())
        },
        loans: loans,
        priceBelief
      });
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
