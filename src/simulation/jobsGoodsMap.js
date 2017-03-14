import type Job from './jobs';
import type Good from './goods';
import * as JOBS from './jobs';
import * as GOODS from './goods';


export const goodsForJobs: Map<Good, Job> = new Map([
  [GOODS.wood, JOBS.woodcutter],
  [GOODS.lumber, JOBS.miller],
  [GOODS.grain, JOBS.farmer],
  [GOODS.tools, JOBS.blacksmith],
  [GOODS.iron_ore, JOBS.miner],
  [GOODS.bread, JOBS.baker],
  [GOODS.iron, JOBS.smelter],
]);
