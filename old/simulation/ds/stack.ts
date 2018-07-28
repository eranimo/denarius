

export default class Stack<T> {
  items: Array<T>;
  count: number;

  constructor() {
    this.items = [];
    this.count = 0;
  }

  get size(): number {
    return this.count;
  }

  // Add a new item on top of the stack
  push(item: T) {
    this.items.push(item);
    this.count = this.count + 1;
  }

  // Remove the item on top of the stack
  pop(): T {
    if(this.count > 0) {
      this.count = this.count - 1;
    }

    return this.items.pop();
  }

  // Get the value of the item on top of the stack
  peek(): T {
    return this.items.slice(-1)[0];
  }
}
