import Simulation from './core/simulation';
import { createPerson } from './person/factory';
import WorldGen from '../worldgen';
import { IWorldMap } from '../worldgen/types';
import ndarray from 'ndarray';


function runSimulation() {
  const sim = new Simulation();

  sim.addAgent(createPerson(sim.tick));

  return sim;
}

export default function initialize() {
  return new Promise((resolve) => {
    const options = {
      seed: 'fuck',
      size: {
        width: 250,
        height: 200,
      },
      terrain: {
        frequency: 122,
      }
    };
    const worldgen = new WorldGen(options);
    console.time('worldgen');
    worldgen.init().then(((worldmap: IWorldMap) => {
      console.timeEnd('worldgen');
      console.log(worldmap);
      (window as any).worldmap = {
        terrain: ndarray(worldmap.terrain, [options.size.width, options.size.height]),
        waterFill: ndarray(worldmap.waterFill, [options.size.width, options.size.height]),
        waterFlow: ndarray(worldmap.waterFlow, [options.size.width, options.size.height]),
      };
      runSimulation();
      resolve();
    }));
  });
}
