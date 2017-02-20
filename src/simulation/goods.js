// @flow
import type { Job } from './jobs';


export type Good = {
  key: string,
  displayName: string
}

export const wood: Good = {
  key: 'wood',
  displayName: 'Wood'
};

export const food: Good = {
  key: 'food',
  displayName: 'Food'
};


export const GOODS: Array<Good> = [wood, food];
