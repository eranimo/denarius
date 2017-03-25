import BetterSet from '../../src/simulation/ds/set';

describe('BetterSet', () => {
  let betterSet: BetterSet;

  it('can add', () => {
     betterSet = new BetterSet();

     expect(betterSet.size).toBe(0);

     betterSet.add({ a: 1 });
     betterSet.add({ a: 1 });
     betterSet.add({ a: 3 });

     expect(betterSet.size).toBe(3);
     expect(betterSet.sumBy((item: Object): number => item.a)).toBe(5);
  });
});
