// @flow
import type { Job } from './jobs';


export type Good = {
  key: string,
  color: string,
  displayName: string
}

export const wood: Good = {
  key: 'wood',
  color: 'brown',
  displayName: 'Wood'
};

export const food: Good = {
  key: 'food',
  color: 'green',
  displayName: 'Food'
};


export const GOODS: Array<Good> = [wood, food];
