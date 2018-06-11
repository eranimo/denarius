// @flow
import { NotImplementedError } from '../errors';

/*
GOAP Planning

Classes:
  - Agent: an entity that has an action
      an agent has goals
  - Action: something an agent does to change its state
      actions know the agent they are acting for
      actions know whether or not they can execute
      they have preconditions that the agent must satisfy for them to execute
      they have effects that modify the agent's state

Functions:
  - plan(): tests whether an agent can

Types:
  - Condition: a function of the state
  - Effect: a modifier for the state
*/

export type Condition = (state) => boolean;
export type Comparator = (oldState, newState) => boolean;
export type Effect = (state) => Object;

export class Action {
  agent: Agent;

  get canExecute(): boolean {
    return true;
  }

  execute() {
    throw new NotImplementedError();
  }

  cost(state): number { // eslint-disable-line
    return 1;
  }

  precondition(state): boolean { // eslint-disable-line
    throw new NotImplementedError();
  }

  effect(state) { // eslint-disable-line
    throw new NotImplementedError();
  }

  toString(): string {
    return `[Action: ${this.constructor.name}]`;
  }
}

export class Agent {
  actions: Set<Action>;
  state;
  currentPlan: Plan;

  constructor() {
    this.actions = new Set();
    this.state = {};
  }

  addAction(action: Action) {
    action.agent = this;
    this.actions.add(action);
  }
}

export class Node {
  parentNode: ?Node;
  action: ?Action;
  cost: number;
  state;
  children: Array<Node>;

  constructor(parentNode: ?Node, action: ?Action, cost: number, state) {
    this.children = [];
    this.parentNode = parentNode;
    if (this.parentNode != null) {
      this.parentNode.children.push(this);
    }
    this.action = action;
    this.cost = cost;
    this.state = state;
  }

  toString(): string {
    return `[Node: action: ${this.action ? this.action.constructor.name : 'none'} cost: ${this.cost} children: ${this.children.length} state: ${JSON.stringify(this.state)}]`;
  }

  graph(indent: string = '  '): string {
    return `${indent}${this.toString()} -> \n` + this.children.map((child: Node): string => {
      return child.graph(indent + '  ');
    }).join('');
  }
}

// plan a sequence of actions for an agent and a goal
export class Plan {
  sequence: Array<Action>;
  totalCost: number;

  constructor(sequence: Array<Action>, totalCost: number) {
    this.sequence = sequence;
    this.totalCost = totalCost;
  }

  static formulate(agent: Agent, goal: Condition, progress: ?Comparator): ?Plan {
    const root: Node = new Node(null, null, 0, agent.state);

    let leaves: Array<Node> = [];

    function buildGraph(parentNode: Node, leaves: Array<Node>, actions: Set<Action>, goal: Condition): boolean {
      // the root of the graph is the agent's state
      let foundOne: boolean = false;
      actions.forEach((action: Action) => {
        if (action.precondition(parentNode.state)) {
          const currentState = action.effect(Object.assign({}, parentNode.state));
          const node: Node = new Node(parentNode, action, parentNode.cost + action.cost(currentState), currentState);

          if (goal(currentState)) { // goal has been reached
            // console.log('goal', action.toString());
            leaves.push(node);
            foundOne = true;
          } else if (progress && progress(parentNode.state, currentState)) {
            // console.log('progress', action.toString());
            const result: boolean = buildGraph(node, leaves, actions, goal);
            if (result) {
              foundOne = true;
            }
          } else { // this action doesn't achieve the goal
            // console.log('nope', action.toString());
            actions.delete(action);
            const found: boolean = buildGraph(node, leaves, actions, goal);
            if (found) {
              foundOne = true;
            }
          }
        }
      });
      return foundOne;
    }


    const found: boolean = buildGraph(root, leaves, agent.actions, goal);
    // console.log('found', found);
    // console.log(root.graph());
    if (found !== true) {
      return null;
    }

    // order the leaves by cost ascending
    leaves = leaves.sort((a: Node, b: Node): number => {
      return a.cost - b.cost;
    });


    const cheapest: Node = leaves[0];
    const sequence: Array<Action> = [];
    let node: ?Node = cheapest;
    let totalCost: number = 0;

    while(node) {
      // console.log('node', node);
      if (node.action) {
        totalCost += node.action.cost(agent);
        // $FlowFixMe
        sequence.unshift(node.action);
      }

      node = node.parentNode;
    }
    // console.log('sequence', sequence);
    const plan: Plan = new Plan(sequence, totalCost);
    agent.currentPlan = plan;
    return plan;
  }
}
