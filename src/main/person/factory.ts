import Person from "./person";

export function createPerson(currentTick: number): Person {
  return new Person(currentTick);
}
