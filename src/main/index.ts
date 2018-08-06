import Simulation from './core/simulation';
import { createPerson } from './person/factory';
import WorldGen from '../worldgen';
import { IWorldGenProps, IWorldGenTick, ISimRuntime } from '../worldgen/types';
import ndarray from 'ndarray';


function runSimulation() {
  const sim = new Simulation();

  sim.addAgent(createPerson(sim.tick));

  return sim;
}

export default function initialize(): Promise<ISimRuntime> {
  return new Promise((resolve) => {
    const options = {
      seed: 'fuck',
      size: {
        width: 120,
        height: 100,
      },
      terrain: {
        frequency: 122,
      }
    };
    const worldgen = new WorldGen(options);
    console.time('worldgen');
    worldgen.init().then(((worldmap: IWorldGenProps) => {
      console.timeEnd('worldgen');
      console.log(worldmap);
      (window as any).worldmap = {
        terrain: ndarray(worldmap.terrain, [options.size.width, options.size.height]),
        ticks: {},
        maxTick: 0,
      };
      runSimulation();
      resolve({
        processTick: () => {
          return new Promise((resolveTick) => {
            worldgen.processTick()
              .then((tickData: IWorldGenTick) => {
                console.log('Tick', tickData);
                (window as any).worldmap.maxTick = Math.max((window as any).worldmap.maxTick, tickData.ticks);
                (window as any).worldmap.ticks[tickData.ticks] = {
                  waterTypes: ndarray(tickData.waterTypes, [options.size.width, options.size.height]),
                  waterFill: ndarray(tickData.waterFill, [options.size.width, options.size.height]),
                  waterFlow: ndarray(tickData.waterFlow, [options.size.width, options.size.height]),
                };
                resolveTick();
              });
            });
        }
      });
    }));
  });
}
