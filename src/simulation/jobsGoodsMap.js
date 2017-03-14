import type Job from './jobs';
import type Good from './goods';
import { JOBS } from './jobs';
import { GOODS } from './goods';


export const goodsForJobs: Map<Job, Good> = new Map([
  [GOODS.wood, JOBS.woodcutter],
  [GOODS.lumber, JOBS.miller],
  [GOODS.grain, JOBS.farmer],
  [GOODS.tools, JOBS.blacksmith],
  [GOODS.iron_ore, JOBS.miner],
  [GOODS.iron, JOBS.smelter],
]);
