import Agent from './agent';
import World from './world';


export default class Simulation {
  tick: number;
  agents: Agent[];
  world: World;

  constructor() {
    this.tick = 0;
    this.agents = [];
    this.world = new World({ width: 100, height: 100 });
  }

  addAgent(agent: Agent) {
    this.agents.push(agent);
  }

  update() {
    this.tick += 1;

    for (const agent of this.agents) {
      agent.update(this.tick);
    }
  }
}
