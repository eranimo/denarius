import BetterSet from '../set';

type Item = { a: number };

describe('BetterSet', () => {
  let betterSet: BetterSet<Item>;

  it('can add', () => {
     betterSet = new BetterSet<Item>();

     expect(betterSet.size).toBe(0);

     betterSet.add({ a: 1 });
     betterSet.add({ a: 1 });
     betterSet.add({ a: 3 });

     expect(betterSet.size).toBe(3);
     expect(betterSet.sumBy((item): number => item.a)).toBe(5);
  });
});
