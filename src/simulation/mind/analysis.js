// @flow
// A consideration is a function that effects something
export class Consideration {
  impact: number;
  test: Function;

  constructor(impact: number, test: (state: Object) => Object) {
    this.impact = impact;
    this.test = test;
  }
}

export class Analysis {
  state: Object;
  considerations: Array<Consideration>;

  constructor(state: Object) {
    this.state = state;
    this.considerations = [];
  }

  add(consideration: Consideration) {
    this.considerations.push(consideration);
  }

  decide(): Object {
    this.considerations.forEach((con: Consideration) => {
      const newState: Object = con.test(this.state);
      this.state = { ...newState };
    });

    return this.state;
  }
}
