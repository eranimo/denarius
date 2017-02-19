// @flow
import type { Good } from './goods';


export default class Inventory {
  store: Map<Good, number>;

  add(good: Good, amount: number) {
    if (!this.store.has(good)) {
      this.store.set(good, amount);
    } else {
      this.store.set(good, this.store.get(good) + amount);
    }
  }

  subtract(good: Good, amount: number) {
    if (this.hasAmount(good, amount)) {
      this.store.set(good, this.get(good) - amount);
    }
    throw new Error(`Missing ${amount} good: ${good.key}`);
  }

  // gets the amount of a good in an inventory, 0 otherwise
  get(good: Good): number {
    return this.store.get(good) || 0;
  }

  // checks if the inventory has the amount of a good
  hasAmount(good: Good, amount: number): bool {
    return (this.get(good) || 0) <= amount;
  }

  // gets the difference between an amount of a good and how much we have
  // if positive, we have a deficit
  // if negative, we have a surplus
  difference(good: Good, amount: number): number {
    return amount - this.get(good);
  }
}
