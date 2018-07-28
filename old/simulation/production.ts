
import * as GOODS from './goods';
import { Good } from './goods';


type Requirement = {
  good: Good,
  amount: number
};

type Blueprint = {
  input: Array<Requirement>,
  output: number
};

export const production: Map<Good, Blueprint> = new Map([
  [GOODS.bread, {
    input: [
      { good: GOODS.grain, amount: 3},
    ],
    output: 2
  }],
  [GOODS.tools, {
    input: [
      { good: GOODS.iron, amount: 2 },
      { good: GOODS.lumber, amount: 2 },
    ],
    output: 1
  }],
  [GOODS.lumber, {
    input: [
      { good: GOODS.wood, amount: 2 },
    ],
    output: 2
  }],
  [GOODS.iron, {
    input: [
      { good: GOODS.iron_ore, amount: 2 },
      { good: GOODS.wood, amount: 1 },
    ],
    output: 2
  }]
]);

export function isRawGood(good: Good): boolean {
  return production.has(good) === false;
}

export function calculateGoodOutput(good: Good): number {
  if (isRawGood(good)) {
    return 4;
  }
  return production.get(good).output;
}

export type ProductionMap = Map<Good, number>;

// gets the production tree for a good
export function blueprintFor(good: Good): ProductionMap {

  function find(good: Good): Array<Requirement> {
    const prod: Blueprint = production.get(good);
    if (!prod) {
      return [];
    }
    let requirements: Array<Requirement> = [];
    for (const req of prod.input) {
      if (production.has(req.good)) {
        // manufactured good
        requirements = requirements.concat(find(req.good));
      } else {
        // raw good
        requirements.push({
          good: req.good,
          amount: req.amount
        });
      }
    }
    return requirements;
  }
  const goodMap: ProductionMap = new Map();

  const reqs: Array<Requirement> = find(good);
  for (const req of reqs) {
    if (goodMap.has(req.good)) {
      goodMap.set(req.good, goodMap.get(req.good) + req.amount);
    } else {
      goodMap.set(req.good, req.amount);
    }
  }
  return goodMap;
}
