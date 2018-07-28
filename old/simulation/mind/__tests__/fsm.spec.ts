// @flow

import { State, StateMachine } from '../fsm';

const mock: Function = jest.fn((str: string): string => str);

class Idle extends State {
  enter() {
    mock('idle: enter');
  }

  leave() {
    mock('idle: leave');
  }

  update() {
    mock('idle: update');
  }
}

class Playing extends State {
  enter() {
    mock('playing: enter');
  }

  leave() {
    mock('playing: leave');
  }

  update() {
    mock('playing: update');
  }
}


class Dog {
  sm: StateMachine<Dog>;

  constructor() {
    this.sm = new StateMachine();

    this.sm.add('idle', new Idle(this));
    this.sm.add('playing', new Playing(this));
  }
}


describe('StateMachine', () => {
  let dog: Dog;

  beforeEach(() => {
    dog = new Dog();
  });

  it('enter', () => {
    dog.sm.enter('idle');

    expect(mock).toHaveBeenCalledWith('idle: enter');
  });

  it('leave', () => {
    dog.sm.enter('idle');
    expect(mock).toHaveBeenCalledWith('idle: enter');
    dog.sm.enter('playing');
    expect(mock).toHaveBeenCalledWith('idle: leave');
    expect(mock).toHaveBeenCalledWith('playing: enter');
  });

  it('update', () => {
    dog.sm.enter('idle');
    dog.sm.update();
    expect(mock).toHaveBeenCalledWith('idle: update');
  });
});
