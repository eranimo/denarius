// @flow
import { companyProducing } from '../src/simulation/init';
import type Company from '../src/simulation/company';
import { Bank } from '../src/simulation/bank';
import Market from '../src/simulation/market';
import * as GOODS from '../src/simulation/goods';


describe('Company', () => {
  let woodCompany: Company;
  let lumberCompany: Company;
  const bank: Bank = new Bank(100);
  let market: Market = new Market({ randomStartPrices: true });

  beforeEach(() => {
    woodCompany = companyProducing(GOODS.wood, market, bank);
    lumberCompany = companyProducing(GOODS.lumber, market, bank);
  });

  // test that companies produce goods using their workers
  // when they have the start inventory
  test('produce', () => {
    expect(woodCompany.products.size).toBe(1);
    expect(lumberCompany.products.size).toBe(1);
    lumberCompany.giveRequiredGoods();
    expect(lumberCompany.inventory.amountOf(GOODS.wood)).toBeGreaterThan(0);
    woodCompany.produce();
    lumberCompany.produce();
    expect(woodCompany.lastRound.idleWorkers).toBe(0);
    expect(lumberCompany.lastRound.idleWorkers).toBe(0);
  });

  test('cost of labor', () => {
    woodCompany.produce();
    // expect(woodCompany)
  });
});
