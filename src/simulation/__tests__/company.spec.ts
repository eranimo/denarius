import { companyProducing } from '../init';
import Company from '../company';
import { Bank } from '../bank';
import Market from '../market';
import * as GOODS from '../goods';


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
    expect(woodCompany.lastRound.idleProducers).toBe(0);
    expect(lumberCompany.lastRound.idleProducers).toBe(0);
  });

  test('cost of labor', () => {
    woodCompany.produce();
  });
});
