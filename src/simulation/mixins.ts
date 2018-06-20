import { Constructor } from './common';


let currentID = 0;


export function HasID<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    id: number;

    static resetIDs() {
      currentID = 0;
    }

    constructor(...args: any[]) {
      super(...args);
      this.id = currentID + 1;
      currentID++;
    }

    toString(): string {
      return `<${this.constructor.name} id: ${this.id}>`;
    }
  };
}
