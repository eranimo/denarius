// @flow
import type Inventory from './inventory';
import * as GOODS from './goods';


export type Job = {
  key: string,
  displayName: string,
  color: string,
  requiredGoods: { [string]: number },
  workFunc: (inventory: Inventory) => Inventory
}

export const woodcutter: Job = {
  key: 'woodcutter',
  displayName: 'Woodcutter',
  color: 'brown',
  requiredGoods: {
    [GOODS.food.key]: 2
  },
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
  requiredGoods: {
    [GOODS.wood.key]: 1
  },
  workFunc(inventory: Inventory): Inventory {
    inventory.add(GOODS.food, 1);
    return inventory;
  }
};
