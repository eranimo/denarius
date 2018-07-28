import { IGood } from "../defs";

export interface InventoryItem {
  good: IGood;
  quantity: number;
  purchasePrice?: number;
  purchaseTick?: number;
}

class InventoryRecord {
  good: IGood;
  items: InventoryItem[];

  constructor(good: IGood) {
    this.good = good;
    this.items = [];
  }

  add(quantity: number, purchasePrice: number, purchaseTick: number) {
    this.items.push({ good: this.good, quantity, purchasePrice, purchaseTick });
  }

  get quantity(): number {
    return this.items.reduce((prev, current) => prev + current.quantity, 0);
  }
}

export default class Inventory {
  private store: Map<IGood, InventoryRecord>;

  constructor() {
    this.store = new Map();
  }

  private getRecord(good: IGood) {
    if (!this.store.has(good)) {
      this.store.set(good, new InventoryRecord(good))
    }
    return this.store.get(good);
  }

  add(
    good: IGood,
    quantity: number,
    purchasePrice?: number,
    purchaseTick?: number,
  ) {
    const record: InventoryRecord = this.getRecord(good);
    record.add(quantity, purchasePrice, purchaseTick);
  }

  has(good: IGood, quantity: number) {
    const record: InventoryRecord = this.getRecord(good);
    return record.quantity >= quantity;
  }

  remove(good: IGood, quantity: number): void {
    const record: InventoryRecord = this.getRecord(good);

    if (record.quantity < quantity) {
      throw new Error(`Tried to remove ${quantity} ${good.name}, have ${record.quantity}`)
    }

    let leftToRemove = quantity;

    while (leftToRemove) {

    }
  }
}
