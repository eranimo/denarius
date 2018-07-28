import Simulation from './core/simulation';
import { createPerson } from './person/factory';

/**

Folder structure:
- core
- labor
- trading
- production

 */

export default function initialize() {
  const sim = new Simulation();

  sim.addAgent(createPerson(sim.tick));

  return sim;
}
