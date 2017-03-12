// @flow

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

export const grain: Good = {
  key: 'grain',
  color: 'green',
  displayName: 'Grain'
};

export const bread: Good = {
  key: 'bread',
  color: 'yellow',
  displayName: 'Bread'
};

export const tools: Good = {
  key: 'tools',
  color: 'silver',
  displayName: 'Tools'
};


export const GOODS: Array<Good> = [wood, grain, bread, tools];
