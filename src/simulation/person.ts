// @flow
import { HasID } from './mixins';
import { AccountHolder } from './bank';
import * as GOODS from './goods';
import { Good } from './goods';
import Inventory from './inventory';
import { HasLogic } from './logic';


/*
  A person has an Account
  A person has a Inventory

  A person has a required amount of goods each round

*/
export default class Person extends HasLogic(HasID(AccountHolder)) {
  lifeNeedsSatisfied: boolean;
  hungerRounds: number;
  inventory: Inventory;

  constructor() {
    super();
    this.inventory = new Inventory();
    this.lifeNeedsSatisfied = true;
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
