import type Job from './jobs';
import type Good from './goods';
import { JOBS } from './jobs';
import { GOODS } from './goods';


export const goodsForJobs: Map<Job, Good> = new Map([
  [GOODS.wood, JOBS.woodcutter],
  [GOODS.food, JOBS.farmer],
]);
