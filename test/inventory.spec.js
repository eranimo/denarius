// @flow
import Inventory from '../src/simulation/inventory';


test('inventory', () => {
  const inventory: Inventory = new Inventory();
  expect(inventory.store.size).toBe(0);
});
