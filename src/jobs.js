// @flow
import type Inventory from './inventory';


export type Job = {
  key: string,
  displayName: string,
  color: string,
  workFunc: (inventory: Inventory) => Inventory
}

export const woodcutter: Job = {
  key: 'woodcutter',
  displayName: 'Woodcutter',
  color: 'brown',
  workFunc(inventory: any): any {
    return inventory;
  }
};

export const farmer: Job = {
  key: 'farmer',
  displayName: 'Farmer',
  color: 'green',
  workFunc(inventory: any): any {
    return inventory;
  }
};
