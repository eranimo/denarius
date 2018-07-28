import { Data } from 'ndarray';

export interface ISize {
  width: number;
  height: number;
}

export interface IGenOptions {
  seed: string;
  size: ISize;
  terrain: {
    frequency: number;
  }
}

export interface IWorldMap {
  terrain: Data<number>;
}
