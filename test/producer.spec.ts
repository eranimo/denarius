// @flow
import * as JOBS from '../src/simulation/jobs';
import * as GOODS from '../src/simulation/goods';
import Producer from '../src/simulation/producer';
import Market from '../src/simulation/market';

describe('Producer', () => {
  const market: Market = new Market();

  it('works', () => {
    const producer: Producer = new Producer(market, JOBS.farmer);
    expect(producer.availableFunds).toBe(0);
    producer.giveStartInventory();
    expect(producer.inventory.amountOf(GOODS.grain)).toBe(0);
    expect(producer.idleRounds).toBe(0);
    expect(producer.workedLastRound).toBe(false);
    producer.work();
    expect(producer.idleRounds).toBe(0);
    expect(producer.employer.inventory.amountOf(GOODS.grain)).toBe(2);
    expect(producer.workedLastRound).toBe(true);
    expect(producer.inventory.size >= 4).toBe(true);
  });
});
