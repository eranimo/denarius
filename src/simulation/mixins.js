// @flow

let idMap: Map<string, number> = new Map();

// $FlowFixMe
export const HasID: Function =
  (base: Function): Function =>
    class extends base {
      id: number;

      static resetIDs() {
        idMap = new Map();
      }

      constructor() {
        super();
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
