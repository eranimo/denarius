// @flow
import Simulation from './simulation';
import setup from './interface';

const simulation: Simulation = new Simulation();

window.simulation = simulation;

// render the UI
setup();