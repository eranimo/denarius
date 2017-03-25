// @flow
import type { Good } from './goods';
import { orderBy } from 'lodash';
import BetterSet from './ds/set';


class Inventory {
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
    for (const [good, amount]: [Good, number] of this.store.entries()) { // eslint-disable-line
      result += amount;
    }
    return result;
  }

  // gets the amount of a good in an inventory, 0 otherwise
  get(good: Good): number {
    return this.store.get(good) || 0;
  }

  set(good: Good, amount: number) {
    this.store.set(good, amount);
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

  export(): Array<Object> {
    const result: Array<Object> = [];
    for (const [good, amount]: [Good, number] of this.store.entries()) {
      result.push({ good, amount });
    }
    return result;
  }

  debug() {
    console.groupCollapsed('inventory');
    for (const [good, amount]: [Good, number] of this.store.entries()) {
      console.log(`${good.key}: ${amount}`);
    }
    console.groupEnd('inventory');
  }
}

export class InventoryRecord {
  good: Good;
  amount: number;
  unitCost: number;

  constructor(good: Good, amount: number, unitCost: number) {
    this.good = good;
    this.amount = amount;
    this.unitCost = unitCost;
  }

  get cost(): number {
    return this.unitCost * this.amount;
  }
}

export class InventorySet {
  store: BetterSet<InventoryRecord>;

  constructor(...data: Array<InventoryRecord>) {
    this.store = new BetterSet(data);
  }

  add(item: InventoryRecord) {
    this.store.add(item);
  }

  merge(set: InventorySet) {
    for (const record: InventoryRecord of set.entries()) {
      this.add(record);
    }
  }

  delete(item: InventoryRecord) {
    this.store.delete(item);
  }

  get totalAmount(): number {
    return this.store.sumBy((item: InventoryRecord): number => item.amount);
  }

  get totalCost(): number {
    return this.store.sumBy((item: InventoryRecord): number => item.cost);
  }

  entries(): Array<InventoryRecord> {
    return Array.from(this.store);
  }
}

class NoGoodsError extends Error {
  message: string;

  constructor(good: Good, amount: ?number) {
    super();
    this.name = 'NoGoodsError';
    this.message = `Inventory doesn't have ${amount || 'any'} of type ${good.displayName}`;
  }
}

export class ValuedInventory {
  // a store of goods kept in descending order of cost (highest cost first)
  store: Map<Good, InventorySet>;

  constructor() {
    this.store = new Map();

    Object.freeze(this);
  }

  add(good: Good, amount: number, cost: number = 0) {
    const records: InventorySet = this.storeFor(good);
    const newRecord: InventoryRecord = new InventoryRecord(good, amount, cost);
    records.add(newRecord);
  }

  // without a number: does the inventory have goods of a type?
  // with a number: does the inventory have the given amount of goods?
  has(good: Good, amount: ?number): boolean {
    const records: InventorySet = this.storeFor(good);
    if (amount) {
      return records.totalAmount >= amount;
    }
    return records.totalAmount > 0;
  }

  hasAmount(good: Good, amount: number): boolean {
    return this.has(good, amount);
  }

  amountOf(good: Good): number {
    const records: InventorySet = this.storeFor(good);
    return records.totalAmount;
  }

  storeFor(good: Good): InventorySet {
    let records: ?InventorySet = this.store.get(good);
    if (!records) {
      records = new InventorySet();
      this.store.set(good, records);
    }
    return records;
  }

  remove(good: Good, amount: number) {
    if (this.hasAmount(good, amount)) {
      this.take(good, amount);
      return;
    }
    throw new NoGoodsError(good, amount);
  }

  move(inventory: ValuedInventory, good: Good, amount: number, order: string = 'asc') {
    if (this.has(good, amount)) {
      const records: InventorySet = inventory.storeFor(good);
      const goods: InventorySet = this.take(good, amount, order);
      records.merge(goods);
      return;
    }
    throw new NoGoodsError(good, amount);
  }

  // without a number: return all goods of a type in the inventory
  // with a number: get a number of goods in the inventory
  // sorted by record cost in ascending order
  // will return an empty InventorySet if no goods are in the inventory for that type
  take(good: Good, amount: number, order: string = 'asc'): InventorySet {
    const records: InventorySet = this.storeFor(good);
    if (!this.has(good, amount)) {
      return new InventorySet();
    }
    // $FlowFixMe
    const sortedRecords: Array<InventoryRecord> = orderBy(records.entries(), ['cost'], [order]);
    let newSet: InventorySet = new InventorySet();
    let left: number = amount; // amount left to take
    // console.log(`\n\n\nTaking ${amount} of ${this.amountOf(good)}`);
    while (left > 0 && sortedRecords.length > 0) {
      const first: InventoryRecord = sortedRecords.shift();
      let take: number;
      let transfered: number;
      // console.log(`\tLeft before: ${left}`);
      // console.log(`\tAmount: ${first.amount}`);
      if (left <= first.amount) {
        // we need 2, we have 5: so take 2 and 0 is left
        take = first.amount - left;
        transfered = first.amount - take;
        first.amount -= left;
        left = 0;
      } else { // left > first.amount
        // we need 5, we have 2: so take 2 and 3 is left
        take = first.amount;
        transfered = first.amount - take;
        first.amount = 0;
        left -= take;
      }
      // console.log(`\tTake: ${take}`);
      // console.log(`\tLeft after: ${left}\n\n\n`);
      newSet.add(new InventoryRecord(good, transfered, first.unitCost));
    }

    for (const record: InventoryRecord of records.entries()) {
      if (record.amount === 0) {
        records.delete(record);
      }
    }
    return newSet;
  }


  totalCostOfGood(good: Good): number {
    const records: InventorySet = this.storeFor(good);
    if (!records) {
      return 0;
    }
    return records.totalCost;
  }

  recordsOf(good: Good): number {
    const records: InventorySet = this.storeFor(good);
    if (!records) {
      return 0;
    }
    return records.store.size;
  }

  get totalCost(): number {
    let totalAmount: number = 0;
    for (const good: Good of this.store.keys()) {
      totalAmount += this.totalCostOfGood(good);
    }
    return totalAmount;
  }

}


export default Inventory;
