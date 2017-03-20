// @flow
import * as JOBS from '../src/simulation/jobs';
import * as GOODS from '../src/simulation/goods';
import Worker from '../src/simulation/worker';


describe('Worker', () => {
  it('works', () => {
    const worker: Worker = new Worker(JOBS.farmer);
    expect(worker.availableFunds).toBe(0);
    worker.giveStartInventory();
    expect(worker.inventory.get(GOODS.bread)).toBe(2);
    expect(worker.inventory.get(GOODS.tools)).toBe(2);
    expect(worker.inventory.get(GOODS.grain)).toBe(0);
    const size: number = worker.inventory.size;
    expect(worker.workedLastRound).toBe(false);
    worker.work();
    expect(worker.inventory.get(GOODS.bread)).toBe(1);
    expect(worker.inventory.get(GOODS.grain)).toBe(2);
    expect(worker.workedLastRound).toBe(true);
    expect(worker.inventory.size).toBeGreaterThan(size);
  });
});
