
import { Good } from './goods';
import { orderBy } from 'lodash';
import BetterSet from './ds/set';


type InventoryRecordExport = {
  good: Good;
  amount: number;
  unitCost: number;
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

  export(): InventoryRecordExport {
    return {
      good: this.good,
      amount: this.amount,
      unitCost: this.unitCost,
    };
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
    for (const record of set.entries()) {
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

  export(): InventoryRecordExport[] {
    return Array.from(this.store).map(item => item.export());
  }
}

class NoGoodsError extends Error {
  message: string;

  constructor(good: Good, amount?: number) {
    super();
    this.name = 'NoGoodsError';
    this.message = `Inventory doesn't have ${amount || 'any'} of type ${good.displayName}`;
  }
}

export type InventoryExport = {
  good: Good
  items: InventoryRecordExport[],
}[];

export default class Inventory {
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

  // TODO: with cost
  addMulti(multi: Map<Good, number>) {
    for (const [good, amount] of multi.entries()) {
      this.add(good, amount);
    }
  }

  // without a number: does the inventory have goods of a type?
  // with a number: does the inventory have the given amount of goods?
  has(good: Good, amount?: number): boolean {
    const records: InventorySet = this.storeFor(good);
    if (amount) {
      return records.totalAmount >= amount;
    }
    return records.totalAmount > 0;
  }

  hasAmounts(multi: Map<Good, number>): boolean {
    for (const [good, amount] of multi.entries()) {
      if (!this.hasAmount(good, amount)) {
        return false;
      }
    }
    return true;
  }

  hasAmount(good: Good, amount: number): boolean {
    return this.has(good, amount);
  }

  amountOf(good: Good): number {
    const records: InventorySet = this.storeFor(good);
    return records.totalAmount;
  }

  storeFor(good: Good): InventorySet {
    let records: InventorySet = this.store.get(good);
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

  removeMulti(multi: Map<Good, number>) {
    if (this.hasAmounts(multi)) {
      for (const [good, amount] of multi.entries()) {
        this.take(good, amount);
      }
    }
    throw new Error('Missing goods to delete');
  }

  moveTo(
    inventory: Inventory,
    good: Good,
    amount: number = this.amountOf(good),
    order: string = 'asc'
  ) {
    if (this.has(good, amount)) {
      const records: InventorySet = inventory.storeFor(good);
      const goods: InventorySet = this.take(good, amount, order);
      records.merge(goods);
      return;
    }
    throw new NoGoodsError(good, amount);
  }

  moveToMulti(
    inventory: Inventory,
    multi: Map<Good, number>,
    order: string = 'asc'
  ) {
    if (this.hasAmounts(multi)) {
      for (const [good, amount] of multi.entries()) {
        this.moveTo(inventory, good, amount, order);
      }
      return;
    }
    throw new Error(`Inventory does not have those goods`);
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

    for (const record of records.entries()) {
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

  export(): InventoryExport {
    let results = [];
    for (const [good, store] of this.store) {
      const item = { good, items: store.export() };
      results.push(item);
    }
    return results;
  }

  get totalCost(): number {
    let cost: number = 0;
    for (const good of this.store.keys()) {
      cost += this.totalCostOfGood(good);
    }
    return cost;
  }

  get size(): number {
    let num: number = 0;
    for (const good of this.store.keys()) {
      const records: InventorySet = this.storeFor(good);
      num += records.totalAmount;
    }
    return num;
  }

}
