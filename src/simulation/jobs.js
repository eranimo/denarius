// @flow
import type Inventory from './inventory';
import type { Good } from './goods';
import * as GOODS from './goods';


export type Job = {
  key: string,
  displayName: string,
  color: string,
  requiredGoods: Map<Good, number>,
  workFunc: (inventory: Inventory) => Inventory
}

export const woodcutter: Job = {
  key: 'woodcutter',
  displayName: 'Woodcutter',
  color: 'brown',
  requiredGoods: new Map([
    [GOODS.food, 2]
  ]),
  workFunc(inventory: Inventory): Inventory {
    inventory.subtract(GOODS.food, 1);
    inventory.add(GOODS.wood, 1);
    return inventory;
  }
};

export const farmer: Job = {
  key: 'farmer',
  displayName: 'Farmer',
  color: 'green',
  requiredGoods: new Map([
    [GOODS.wood, 1]
  ]),
  workFunc(inventory: Inventory): Inventory {
    inventory.add(GOODS.food, 1);
    return inventory;
  }
};