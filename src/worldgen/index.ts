import { IWorldMap, IGenOptions } from "./types";
import * as WorldgenWorker from './workers/worldgen.worker';


export default class WorldGen {
  options: IGenOptions;
  worker: typeof WorldgenWorker;

  constructor(options: IGenOptions) {
    this.options = options;
    this.worker = (WorldgenWorker as any)() as typeof WorldgenWorker;
  }

  async init(): Promise<IWorldMap> {
    const map = await this.worker.init(this.options);
    console.log('init: ', map);
    return map;
  }
}
