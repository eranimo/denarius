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
    const worldgen = new WorldGen({
      seed: Math.random().toString(),
      size: {
        width: 100,
        height: 100,
      },
      terrain: {
        frequency: 122,
      }
    });
    worldgen.init().then(((worldmap: IWorldMap) => {
      console.log(worldmap);
      (window as any).worldmap = {
        terrain: ndarray(worldmap.terrain, [100, 100])
      };
      runSimulation();
      resolve();
    }));
  });
}
