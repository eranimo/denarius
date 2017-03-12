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

/*
bread, lumber, tools -> grain
bread, tools -> iron_ore
bread, tools, timber -> lumber
bread, tools -> timber
bread, iron, lumber -> tools
bread, iron_ore, tools -> iron
grain -> bread
*/

export const woodcutter: Job = {
  key: 'woodcutter',
  displayName: 'Woodcutter',
  color: 'brown',
  idealInventory: new Map([
    [GOODS.bread, 4],
    [GOODS.tools, 2]
  ]),
  requiredGoods: new Map([
    [GOODS.bread, 2],
    [GOODS.tools, 1]
  ]),
  workFunc(inventory: Inventory): Inventory {
    if (_.random(5) === 0) {
      inventory.subtract(GOODS.tools, 1);
    }
    inventory.subtract(GOODS.bread, 2);
    inventory.add(GOODS.wood, 1);
    return inventory;
  }
};

export const farmer: Job = {
  key: 'farmer',
  displayName: 'Farmer',
  color: 'green',
  idealInventory: new Map([
    [GOODS.wood, 2],
    [GOODS.bread, 2],
    [GOODS.tools, 2]
  ]),
  requiredGoods: new Map([
    [GOODS.wood, 1],
    [GOODS.bread, 1],
    [GOODS.tools, 1]
  ]),
  workFunc(inventory: Inventory): Inventory {
    if (_.random(5) === 0) {
      inventory.subtract(GOODS.tools, 1);
    }
    inventory.subtract(GOODS.wood, 1);
    inventory.subtract(GOODS.bread, 1);
    inventory.add(GOODS.grain, 1);
    return inventory;
  }
};

export const baker: Job = {
  key: 'baker',
  displayName: 'Baker',
  color: 'yellow',
  idealInventory: new Map([
    [GOODS.grain, 5],
    [GOODS.tools, 2]
  ]),
  requiredGoods: new Map([
    [GOODS.grain, 2],
    [GOODS.tools, 1]
  ]),
  workFunc(inventory: Inventory): Inventory {
    if (_.random(15) === 0) {
      inventory.subtract(GOODS.tools, 1);
    }
    inventory.subtract(GOODS.grain, 2);
    inventory.add(GOODS.bread, 2);
    return inventory;
  }
};


export const blacksmith: Job = {
  key: 'blacksmith',
  displayName: 'Blacksmith',
  color: 'silver',
  idealInventory: new Map([
    [GOODS.wood, 6],
    [GOODS.bread, 4]
  ]),
  requiredGoods: new Map([
    [GOODS.wood, 4],
    [GOODS.bread, 2]
  ]),
  workFunc(inventory: Inventory): Inventory {
    inventory.subtract(GOODS.wood, 4);
    inventory.subtract(GOODS.bread, 2);
    inventory.add(GOODS.tools, 1);
    return inventory;
  }
};


export const JOBS: Array<Job> = [woodcutter, farmer, baker, blacksmith];
