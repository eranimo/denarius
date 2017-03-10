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

export const food: Good = {
  key: 'food',
  color: 'green',
  displayName: 'Food'
};

export const tools: Good = {
  key: 'tools',
  color: 'silver',
  displayName: 'Tools'
};


export const GOODS: Array<Good> = [wood, food, tools];
