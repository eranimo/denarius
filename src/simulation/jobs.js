// @flow
import type Inventory from './inventory';
import type { Good } from './goods';
import * as GOODS from './goods';
import _ from 'lodash';


export type Job = {
  key: string,
  displayName: string,
  color: string,
  idealInventory: Map<Good, number>,
  requiredGoods: Map<Good, number>,
  workFunc: (inventory: Inventory) => Inventory
}

export const woodcutter: Job = {
  key: 'woodcutter',
  displayName: 'Woodcutter',
  color: 'brown',
  idealInventory: new Map([
    [GOODS.food, 5],
    [GOODS.tools, 2]
  ]),
  requiredGoods: new Map([
    [GOODS.food, 2],
    [GOODS.tools, 1]
  ]),
  workFunc(inventory: Inventory): Inventory {
    if (_.random(10) === 0) {
      inventory.subtract(GOODS.tools, 1);
    }
    inventory.subtract(GOODS.food, 2);
    inventory.add(GOODS.wood, 1);
    return inventory;
  }
};

export const farmer: Job = {
  key: 'farmer',
  displayName: 'Farmer',
  color: 'green',
  idealInventory: new Map([
    [GOODS.wood, 5],
    [GOODS.tools, 2]
  ]),
  requiredGoods: new Map([
    [GOODS.wood, 2],
    [GOODS.tools, 1]
  ]),
  workFunc(inventory: Inventory): Inventory {
    if (_.random(10) === 0) {
      inventory.subtract(GOODS.tools, 1);
    }
    inventory.subtract(GOODS.wood, 2);
    inventory.add(GOODS.food, 1);
    return inventory;
  }
};


export const blacksmith: Job = {
  key: 'blacksmith',
  displayName: 'Blacksmith',
  color: 'silver',
  idealInventory: new Map([
    [GOODS.wood, 6]
  ]),
  requiredGoods: new Map([
    [GOODS.wood, 4]
  ]),
  workFunc(inventory: Inventory): Inventory {
    inventory.subtract(GOODS.wood, 4);
    inventory.add(GOODS.tools, 1);
    return inventory;
  }
};


export const JOBS: Array<Job> = [woodcutter, farmer, blacksmith];
