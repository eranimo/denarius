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

export const lumber: Good = {
  key: 'lumber',
  color: 'maroon',
  displayName: 'Lumber'
};

export const grain: Good = {
  key: 'grain',
  color: 'green',
  displayName: 'Grain'
};

export const iron_ore: Good = {
  key: 'iron_ore',
  color: 'gray',
  displayName: 'Iron Ore'
};

export const iron: Good = {
  key: 'iron',
  color: 'darkgrey',
  displayName: 'Iron'
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


export const GOODS: Array<Good> = [wood, grain, bread, tools, iron_ore, iron, lumber];
