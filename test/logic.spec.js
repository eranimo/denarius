// @flow
import { HasLogic, LOGIC } from '../src/simulation/logic';

class Foobar extends HasLogic() {
  baz(): boolean {
    return true;
  }
}


describe('Logic', () => {
  const foobar: Foobar = new Foobar();

  it('addLogic', () => {
    foobar.addLogic(LOGIC.producer);

    expect(foobar.logic.size).toBe(1);
    expect((): void => foobar.addLogic(LOGIC.producer))
      .toThrowError("Already has logic 'producer'");
    expect((): void => foobar.addLogic(LOGIC.none))
      .toThrowError("Logic 'undefined' not found");
  });

  it('hasLogic', () => {
    expect(foobar.hasLogic(LOGIC.producer)).toBe(true);
  });


});
