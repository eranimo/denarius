// @flow
import { NotImplementedError } from '../errors';


export class State<T> {
  entity: T;

  constructor(entity: T) {
    this.entity = entity;
  }

  enter() {
    throw new NotImplementedError();
  }

  leave() {
    throw new NotImplementedError();
  }

  update() {
    throw new NotImplementedError();
  }
}

/*
A simple state machine without events
States may transition by calling enter() in the state's update() function
*/
export class StateMachine<T> {
  states: Map<string, State<T>>;
  current: State<T>;

  constructor() {
    this.states = new Map();
  }

  add(name: string, state: State<T>) {
    this.states.set(name, state);
  }

  has(name: string): boolean {
    return this.states.has(name);
  }

  enter(name: string) {
    if (this.current) {
      this.current.leave();
    }

    if (!this.has(name)) {
      throw new Error(`State '${name}' not found`);
    }
    // $FlowFixMe
    this.current = this.states.get(name);
    // $FlowFixMe
    this.current.enter();
  }

  update() {
    if (this.current) {
      this.current.update();
    }
  }
}
