// @flow
import { blueprintFor, ProductionMap } from '../production';
import * as GOODS from '../goods';


describe('production', () => {
  test('blueprintFor', () => {
    const requirements: ProductionMap = blueprintFor(GOODS.tools);

    expect(requirements.get(GOODS.iron_ore)).toBe(2);
    expect(requirements.get(GOODS.wood)).toBe(3);
  });
});
