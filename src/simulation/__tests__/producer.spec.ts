import * as JOBS from '../jobs';
import * as GOODS from '../goods';
import Producer from '../producer';
import Product from '../product';
import Company from '../company';
import Market from '../market';

describe('Producer', () => {
  const market: Market = new Market();

  it('works', () => {
    const producer: Producer = new Producer(market, JOBS.farmer);
    const company = new Company(market);
    producer.product = new Product(GOODS.grain, company, producer);
    producer.changeEmployer(company);
    expect(producer.availableFunds).toBe(0);
    producer.giveStartInventory();
    expect(producer.inventory.amountOf(GOODS.grain)).toBe(0);
    expect(producer.idleRounds).toBe(0);
    expect(producer.workedLastRound).toBe(false);

    const didWork = producer.work();
    expect(didWork).toBe(true);
    expect(producer.idleRounds).toBe(0);
    expect(producer.employer.inventory.amountOf(GOODS.grain)).toBe(1);
    expect(producer.workedLastRound).toBe(true);
    expect(producer.employer.inventory.size).toBe(1);
  });
});
