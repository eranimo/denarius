// @flow
import type { Condition } from '../../src/simulation/mind/goap';
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
    this.addAction(new ChopLog(this));
    this.addAction(new GetAxe(this));
    this.addAction(new CollectBranches(this));
  }

  plan(): ?Plan {
    return Plan.formulate(this, makeFirewood);
  }
}


describe('Plan', () => {
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
    expect(plan.sequence[0]).toBeInstanceOf(GetAxe);
    expect(plan.sequence[1]).toBeInstanceOf(ChopLog);
  });
});
