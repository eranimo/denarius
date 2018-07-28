export interface ISkill {
  name: string;
  modifier: string; // modifier the skill changes
  xpGainFactor: number; // how fast XP gains for this skill
}

export interface IGood {
  name: string;
}

export const skills: ISkill[] = require('./skills.json');
export const goods: IGood[] = require('./goods.json');
