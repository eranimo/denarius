// @flow
import Stack from '../stack';

describe('Stack', () => {
  let stack: Stack<number>;

  beforeEach(() => {
    stack = new Stack();
  });

  it('can push', () => {
     expect(stack.size).toBe(0);

     stack.push(1);
     stack.push(2);
     stack.push(3);

     expect(stack.size).toBe(3);
  });

  it('can get size', () => {
    stack.push(1);
    expect(stack.size).toBe(1);
  });

  it('can pop', () => {
    stack.push(1);
    const num: number = stack.pop();
    expect(stack.size).toBe(0);
    expect(num).toBe(1);
  });

  it('can peek', () => {
    stack.push(1);
    const num: number = stack.peek();
    expect(stack.size).toBe(1);
    expect(num).toBe(1);
  });
});
