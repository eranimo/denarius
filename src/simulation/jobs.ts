
import { Good } from './goods';
import * as GOODS from './goods';


export type Job = {
  key: string,
  displayName: string,
  color: string,
  output: Good,
};

/*
bread, lumber, tools -> grain
bread, tools -> iron_ore
bread, tools, timber -> lumber
bread, tools -> timber
bread, iron, lumber -> tools
bread, iron_ore, tools -> iron
grain -> bread
*/

export const woodcutter: Job = {
  key: 'woodcutter',
  displayName: 'Woodcutter',
  color: 'brown',
  output: GOODS.wood
};

export const miller: Job = {
  key: 'miller',
  displayName: 'Miner',
  color: 'maroon',
  output: GOODS.lumber
};

export const farmer: Job = {
  key: 'farmer',
  displayName: 'Farmer',
  color: 'green',
  output: GOODS.grain
};

export const baker: Job = {
  key: 'baker',
  displayName: 'Baker',
  color: 'yellow',
  output: GOODS.bread
};

export const blacksmith: Job = {
  key: 'blacksmith',
  displayName: 'Blacksmith',
  color: 'silver',
  output: GOODS.tools
};

export const miner: Job = {
  key: 'miner',
  displayName: 'Miner',
  color: 'grey',
  output: GOODS.iron_ore
};

export const smelter: Job = {
  key: 'smelter',
  displayName: 'Smelter',
  color: 'darkgrey',
  output: GOODS.iron
};


export const JOBS: Array<Job> = [woodcutter, farmer, baker, blacksmith, miller, smelter, miner];
