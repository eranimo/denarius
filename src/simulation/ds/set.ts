// @flow

export default class BetterSet<T = any> extends Set {
  sumBy(getter: any): number {
    let result: number = 0;
    for (const item of this) {
      result += getter(item);
    }
    return result;
  }

  isSuperset(subset: Set<any>): boolean {
    for (const elem of subset) {
      if (!this.has(elem)) {
        return false;
      }
    }
    return true;
  }

  union(setB: Set<T>): Set<T> {
    const union: Set<any> = new Set(this);
    for (const elem of setB) {
      union.add(elem);
    }
    return union;
  }

  intersection(setB: Set<T>): Set<T> {
    const intersection: Set<T> = new Set();
    for (const elem of setB) {
      if (this.has(elem)) {
        intersection.add(elem);
      }
    }
    return intersection;
  }

  difference(setB: Set<T>): Set<T> {
    const difference: Set<T> = new Set(this);
    for (const elem of setB) {
      difference.delete(elem);
    }
    return difference;
  }
}
