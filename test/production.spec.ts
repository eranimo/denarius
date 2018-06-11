// @flow
import { blueprintFor } from '../src/simulation/production';
import * as GOODS from '../src/simulation/goods';
import type { ProductionMap } from '../src/simulation/production';


describe('production', () => {
  test('blueprintFor', () => {
    const requirements: ProductionMap = blueprintFor(GOODS.tools);

    expect(requirements.get(GOODS.iron_ore)).toBe(2);
    expect(requirements.get(GOODS.wood)).toBe(3);
  });
});
