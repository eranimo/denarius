import { ISkill } from '../defs';


export default class SkillValue {
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
