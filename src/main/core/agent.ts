export default abstract class Agent {
  ticks: number;

  constructor() {
    this.ticks = 0;
  }

  update(ticks: number) {
    this.ticks = ticks;
    this.onUpdate();
  }

  onUpdate() {}
}
