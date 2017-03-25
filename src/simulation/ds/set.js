// @flow

export default class BetterSet<Object> extends Set {
  sumBy(getter: any): number {
    let result: number = 0;
    for (const item: Object of this) {
      result += getter(item);
    }
    return result;
  }

  isSuperset(subset: Set<*>): boolean {
    for (const elem: * of subset) {
      if (!this.has(elem)) {
        return false;
      }
    }
    return true;
  }

  union(setB: Set<*>): Set<*> {
    const union: Set<*> = new Set(this);
    for (const elem: * of setB) {
      union.add(elem);
    }
    return union;
  }

  intersection(setB: Set<*>): Set<*> {
    const intersection: Set<*> = new Set();
    for (const elem: * of setB) {
      if (this.has(elem)) {
        intersection.add(elem);
      }
    }
    return intersection;
  }

  difference(setB: Set<*>): Set<*> {
    const difference: Set<*> = new Set(this);
    for (const elem: * of setB) {
      difference.delete(elem);
    }
    return difference;
  }
}
