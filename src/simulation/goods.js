// @flow
import * as JOBS from './jobs';
import type { Job } from './jobs';


export type Good = {
  key: string,
  displayName: string,
  producer: Job
}

export const wood: Good = {
  key: 'wood',
  displayName: 'Wood',
  producer: JOBS.woodcutter
};

export const food: Good = {
  key: 'food',
  displayName: 'Food',
  producer: JOBS.farmer
};


export const GOODS: Array<Good> = [wood, food];
