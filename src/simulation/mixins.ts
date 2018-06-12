import { Constructor } from './common';


let idMap: Map<string, number> = new Map();


export function HasID<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    id: number;

    static resetIDs() {
      idMap = new Map();
    }

    constructor(...args: any[]) {
      super(...args);
      const name: string = this.constructor.name;
      if (idMap.has(name)) {
        this.id = idMap.get(name) + 1;
        idMap.set(name, this.id);
      } else {
        idMap.set(name, 1);
        this.id = 1;
      }
    }

    toString(): string {
      return `<${this.constructor.name} id: ${this.id}>`;
    }
  };
}
