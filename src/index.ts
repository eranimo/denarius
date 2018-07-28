
import initalizeSimulation from './main';
import setupInterface from './interface';


(window as any).simulation = initalizeSimulation()
  .then(setupInterface);
