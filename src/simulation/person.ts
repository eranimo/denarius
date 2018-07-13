
import { HasID } from './mixins';
import { AccountHolder } from './bank';
import * as GOODS from './goods';
import { Good } from './goods';
import Inventory from './inventory';

interface ISkill {
  name: string;
  modifier: string; // modifier the skill changes
  xpGainFactor: number; // how fast XP gains for this skill
}

export const skills: ISkill[] = require('./data/skills.json');

class SkillValue {
  type: ISkill;
  experience: number;
  nextLevelXP: number;
  level: 0;

  constructor(type: ISkill) {
    this.type = type;
    this.experience = 0;
    this.level = 0;
    this.nextLevelXP = this.calculateXP(1);
  }

  private calculateXP(level: number) {
    return 50 + 8 * this.type.xpGainFactor ^ (this.level + 1);
  }

  addXP(xp: number) {
    this.experience += xp;
    if (this.nextLevelXP >= this.experience) {
      this.level += 1;
      this.nextLevelXP = this.calculateXP(this.level + 1);
      // TODO: dispatch event?
    }
  }
}

export default class Person extends HasID(AccountHolder) {
  lifeNeedsSatisfied: boolean;
  hungerRounds: number;
  inventory: Inventory;
  attributes: {
    [attributeName: string]: number
  };
  skills: {
    [attributeName: string]: SkillValue
  };

  constructor() {
    super();
    this.inventory = new Inventory();
    this.lifeNeedsSatisfied = true;

    this.attributes = {};
    this.skills = {}
  }

  setSkill(skill: ISkill) {
    this.skills[skill.name] = new SkillValue(skill);
  }

  getSkillLevel(skill: ISkill) {
    return this.skills[skill.name] === undefined ? 0 : this.skills[skill.name];
  }

  get lifeNeeds(): Map<Good, number> {
    return new Map([
      [GOODS.bread, 1,]
    ]);
  }

  // the live function is called every round and it consumes resources
  live() {
    if (this.inventory.hasAmounts(this.lifeNeeds)) {
      this.inventory.removeMulti(this.lifeNeeds);
      this.lifeNeedsSatisfied = true;
      this.hungerRounds = 0;
    } else {
      this.lifeNeedsSatisfied = false;
      this.hungerRounds++;
    }
  }
}
