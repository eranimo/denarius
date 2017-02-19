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
}
