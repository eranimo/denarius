// @flow
import type { Good } from './goods';
import _ from 'lodash';


export default class Inventory {
  store: Map<Good, number>;

  constructor() {
    this.store = new Map();
  }

  add(good: Good, amount: number) {
    if (!this.store.has(good)) {
      this.store.set(good, amount);
    } else {
      this.store.set(good, this.store.get(good) + amount);
    }
  }

  subtract(good: Good, amount: number): boolean {
    if (this.hasAmount(good, amount)) {
      this.store.set(good, this.get(good) - amount);
      return true;
    } else {
      return false;
    }
  }

  get size(): number {
    let result: number = 0;
    for (const [good, amount]: [Good, number] of this.store.entries()) {
      result += amount;
    }
    return result;
  }

  // gets the amount of a good in an inventory, 0 otherwise
  get(good: Good): number {
    return this.store.get(good) || 0;
  }

  // checks if the inventory has the amount of a good
  hasAmount(good: Good, amount: number): boolean {
    return this.get(good) >= amount;
  }

  // returns the difference of this inventory and a map of goods
  // if positive, we have a deficit
  // if negative, we have a surplus
  difference(goodMap: Map<Good, number>): Map<Good, number> {
    let result: Map<Good, number> = new Map;
    for (const [myGood, myAmount]: [Good, number] of this.store.entries()) {
      if (goodMap.has(myGood)) {
        for (const [theirGood, theirAmount]: [Good, number] of goodMap.entries()) {
          if (myGood == theirGood) {
            result.set(myGood, myAmount - theirAmount);
          }
        }
      } else {
        result.set(myGood, myAmount);
      }
    }
    return result;
  }

  // does this inventory have these goods?
  hasGoods(goodMap: Map<Good, number>): boolean {
    for (const [good, amount]: [Good, number] of goodMap.entries()) {
      const result: boolean = this.hasAmount(good, amount);
      if (!result) {
        return false;
      }
    }
    return true;
  }

  // takes a map of goods
  takeGoods(goodMap: Map<Good, number>): boolean {
    if (this.hasGoods(goodMap) === false) {
      return false;
    }

    for (const [good, amount]: [Good, number] of goodMap.entries()) {
      this.subtract(good, amount);
    }

    return true;
  }

  giveGoods(goodMap: Map<Good, number>): boolean {
    for (const [good, amount]: [Good, number] of goodMap.entries()) {
      this.add(good, amount);
    }

    return true;
  }

  debug() {
    console.groupCollapsed('inventory');
    for (const [good, amount]: [Good, number] of this.store.entries()) {
      console.log(`${good.key}: ${amount}`);
    }
    console.groupEnd('inventory');
  }
}
