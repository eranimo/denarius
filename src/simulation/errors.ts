export class NotImplementedError extends Error {
  constructor() {
    super();
    this.message = 'This method must be implemented by the extending class';
  }
}
