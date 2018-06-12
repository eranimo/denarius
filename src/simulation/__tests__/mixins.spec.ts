import { HasID } from '../mixins';

class Base {}
class Foobar extends HasID(Base) {}


describe('HasID', () => {
  beforeEach(() => {
    Foobar.resetIDs();
  });

  it('provides first id number', () => {
    let one: Foobar = new Foobar();
    expect(one.id).toBe(1);
  });

  it('provides two numbers', () => {
    let one: Foobar = new Foobar();
    let two: Foobar = new Foobar();
    expect(one.id).toBe(1);
    expect(two.id).toBe(2);
  });

  it('provides toString method', () => {
    let one: Foobar = new Foobar();
    expect(one.toString()).toBe(`<Foobar id: ${one.id}>`);
  });
});
