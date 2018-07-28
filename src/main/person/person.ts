import Agent from '../core/agent';
import SkillValue from './skillValue';
import { IDate, calculateDate } from '../core/time';
import Inventory from './inventory';
import { chance } from '../utils/random';


export default class Person extends Agent {
  isAlive: boolean;
  birthDate: IDate;
  name: string;
  birthTick: number;
  deathTick: number | null;
  skills: { [name: string]: SkillValue };
  inventory: Inventory;

  constructor(birthTick: number) {
    super();
    this.name = chance.name();
    this.isAlive = true;
    this.birthTick = birthTick;
    this.birthDate = calculateDate(birthTick);
    this.inventory = new Inventory();
    this.deathTick = null;
  }

  get exactAge(): IDate {
    return calculateDate(this.ticks - this.birthTick);
  }

  die() {
    this.isAlive = false;
    this.deathTick = this.ticks;
  }

  onUpdate() {
    // check for health
    // check for skill advancement
  }
}
