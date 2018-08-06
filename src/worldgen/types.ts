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

export interface IWorldGenProps {
  terrain: Data<number>;
  sealevel: number;
}

export interface IWorldGenTick {
  ticks: number;
  waterTypes: Data<number>;
  waterFill: Data<number>;
  waterFlow: Data<number>;
}

export enum WaterTypes {
  NO_WATER,
  OCEAN,
  SMALL_RIVER,
  LARGE_RIVER,
  LAKE,
  STREAM,
}

export interface ISimRuntime {
  processTick: Function
};
