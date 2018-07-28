interface ISize {
  width: number,
  height: number;
}

export default class World {
  size: ISize;

  constructor(size: ISize) {
    this.size = size;
  }
}
