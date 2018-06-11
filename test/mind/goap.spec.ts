// @flow
import type { Condition, Comparator } from '../../src/simulation/mind/goap';
import {
  Action,
  Agent,
  Plan,
} from '../../src/simulation/mind/goap';


// actions
class ChopLog extends Action {
  cost(): number {
    return 4;
  }

  precondition(state: Object): boolean {
    return !state.hasLog && state.hasAxe;
  }

  effect(state: Object): Object {
    state.hasLog = true;
    return state;
  }
}

class GetAxe extends Action {
  cost(): number {
    return 2;
  }

  precondition(state: Object): boolean {
    return !state.hasAxe && state.canGetAxe;
  }

  effect(state: Object): Object {
    state.hasAxe = true;
    return state;
  }
}

class CollectBranches extends Action {
  cost(): number {
    return 8;
  }

  precondition(state: Object): boolean {
    return !state.hasLog;
  }

  effect(state: Object): Object {
    state.hasLog = true;
    return state;
  }
}

// goal
const makeFirewood: Condition = (state: Object): boolean => state.hasLog;

// agent
class Woodcutter extends Agent {
  constructor(state: Object) {
    super();
    this.state = state;
    /*
    GetAxe -> ChopLog (total: 6)
    GetAxe -> CollectBranches (total: 10)
    CollectBranches (total: 8)
    */
    this.addAction(new ChopLog());
    this.addAction(new GetAxe());
    this.addAction(new CollectBranches());
  }

  plan(): ?Plan {
    return Plan.formulate(this, makeFirewood);
  }
}


describe('Woodcutter Plan', () => {
  let woodcutter: Woodcutter;

  // best way to get ore is to CollectBranches
  it('best way to get ore without axes', () => {
    woodcutter = new Woodcutter({
      hasLog: false,
    });

    expect(woodcutter.state.hasLog).toBe(false);
    const plan: ?Plan = woodcutter.plan();
    expect(plan).not.toBe(false);
    if (!plan) {
      return;
    }

    expect(plan.sequence.length).toBe(1);
    expect(plan.sequence[0]).toBeInstanceOf(CollectBranches);
    expect(plan.totalCost).toBe(8);
  });

  // best way to get ore is to GetAxe -> ChopLog
  it('best way to get ore with axes', () => {
    woodcutter = new Woodcutter({
      hasLog: false,
      canGetAxe: true,
      hasAxe: false,
    });
    const plan: ?Plan = woodcutter.plan();
    expect(plan).not.toBe(false);
    if (!plan) {
      return;
    }

    expect(plan.sequence.length).toBe(2);
    expect(plan.totalCost).toBe(6);
    expect(plan.sequence[0]).toBeInstanceOf(GetAxe);
    expect(plan.sequence[1]).toBeInstanceOf(ChopLog);
  });
});


class MineOre extends Action {
  cost(): number {
    return 1;
  }

  precondition(): boolean {
    return true;
  }

  effect(state: Object): Object {
    state.numOre++;
    return state;
  }
}

const mineFiveOre: Condition = (state: Object): boolean => state.numOre >= 5;
const oreIncreasing: Comparator = (oldState: Object, newState: Object): boolean => newState.numOre > oldState.numOre;

class Miner extends Agent {
  constructor() {
    super();
    this.state = {
      numOre: 0
    };

    this.addAction(new MineOre());
  }

  plan(): ?Plan {
    return Plan.formulate(this, mineFiveOre, oreIncreasing);
  }
}

describe('Miner Plan', () => {
  it('plan to mine 5 more', () => {
    const miner: Miner = new Miner();

    expect(miner.state.numOre).toBe(0);
    const plan: ?Plan = miner.plan();
    expect(plan).not.toBe(null);
    if (!plan) {
      return;
    }
    expect(plan.sequence.length).toBe(5);
    expect(plan.totalCost).toBe(5);
  });
});
