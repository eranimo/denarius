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
  waterTypes: Data<number>;
  waterFill: Data<number>;
  waterFlow: Data<number>;
  sealevel: number;
}

export enum WaterTypes {
  NO_WATER,
  OCEAN,
  SMALL_RIVER,
  LARGE_RIVER,
  STREAM,
}
